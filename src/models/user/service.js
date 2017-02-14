'use strict';
const
    _ = require('lodash'),
    validator = require('validator'),
    Promise = require('bluebird'),
    boom = require('boom'),
    bcrypt = Promise.promisifyAll(require('bcryptjs')),
    Utils = require('./../../utils/utils'),
    redis = require('./../../config/redis')(),
    config = require('./../../config/config'),
    logger = require('./../../config/log'),
    EmailService = require('./../email/service'),
    RoleService = require('./../role/service'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    /**@type {Model.<User>}*/
    {User} = models;

const UserService = {
    /**
     * @param {String|UUID}data.id
     * @param {sequelize.Association[]}data.include
     *@return {Promise.<Instance.<User>,Error>}
     */
    getById: data => {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`User GetById: missing params object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`User GetById: User ID [${data.id}] is not a valid UUID`));
        }
        return User.scope('general').findOne({where: {id: data.id}, include: data.include})
            .then(/**Instance.<User>*/user => {
                if (!user) {
                    throw boom.notFound(`No User with ID [${data.id}] found`);
                }
                return user;
            })

    },
    /**
     * @param {String|UUID} id - ID of the lead
     * @param {Object.<String,?>} data - payload
     * @returns {Promise.<Instance<User>,Error>}
     */
    update: (id, data) => {
        if (!id || !validator.isUUID(id)) {
            return Promise.reject(boom.badRequest(`UserID [${id}] is not a valid UUID`));
        }
        if (typeof data !== 'object') {
            return Promise.reject(boom.badRequest("Missing or incorrect Data"));
        }
        let filtered = Utils.filterPayload(data, User, ['id', 'createdAt', 'updatedAt', 'Lab', 'Dentist', 'emailVerified'], ['oldPassword']);
        return User.unscoped().findById(id)
            .then(/**Instance.<User>*/user => {
                if (!user) {
                    throw boom.notFound(`No User with ID [${id}] exists`);
                }
                return user;
            })
            .then(user => [user, UserService._validateUpdateUser(filtered, user)])
            .spread(user => [user, !!filtered.password && UserService.encryptPassword(filtered.password).then(pass => filtered.password = pass)])
            .spread(user => user.update(filtered))
            .return(User.scope('general').findById(id));
    },
    /**
     * @param {String} payload.businessName
     * @param {String} payload.email
     * @param {String} payload.password
     * @param {String} payload.type
     * @return {Promise.<Instance.<User>,Error>}
     */
    create: payload => {
        if (!payload || typeof payload !== 'object') {
            return Promise.reject(boom.badData('Missing payload data'));
        }
        let {sequelize, Bank, Client} = models,
            roleTable = payload.type === 'Bank' ? Bank : Client;
        return UserService._validateCreateUser(payload)
            .then(() => [sequelize.transaction({autocommit: false}), UserService.encryptPassword(payload.password), RoleService.findRoleByName(payload.type)])
            .spread((/**sequelize.Transaction*/transaction, /**String*/encryptedPassword, /**Instance.<Role>*/ role) => {

                return User.create({email: payload.email, password: encryptedPassword, roleId: role.id}, {transaction})
                    .then(/**Instance.<User>*/createdUser => {
                        return [
                            roleTable.create({userId: createdUser.id,businessName: payload.businessName}, {transaction}),
                            createdUser
                        ];
                    })
                    .spread((/**Instance*/createdOrg, /**Instance.<User>*/user) => {
                        // user.set(payload.type, createdOrg, {raw: true});
                        // org.findById(createdOrg.id)
                        //     .then(entity => {
                        //         let token = `verify-${Utils.randomString(config.verifyEmail.tokenLength, 'aA#')}`;
                        //         return [
                        //             entity,
                        //             token,
                        //             redis.setexAsync(token, config.verifyEmail.expirationSeconds, payload.email)
                        //         ]
                        //     })
                        //     .spread(EmailService.sendSignUpEmail.bind(EmailService))
                        //     .catch(err => logger.error(`Failed to send signup email to [${payload.email}]`, err));
                        return transaction.commit().return(user);
                    })
                    .catch(err => {
                        return transaction.rollback().throw(err);
                    })
            })
    },
    /**
     * @param {String}email
     * @return {Promise.<String,Error>}
     */
    generateForgotPasswordToken: email => {
        if (typeof email !== 'string' || !validator.isEmail(email)) {//Maybe we should check only for string type?
            return Promise.reject(boom.badData(`[${email}] is not a valid email address`));
        }
        return User.find({where: {email}})
            .then(/**Instance.<User>*/user => {
                if (!user) {
                    throw boom.notFound(`User with email [${email}] not exists`);
                }
                let token = Utils.randomString(config.forgotPassword.tokenLength, 'aA#');
                return [
                    redis.setexAsync(UserService._generateForgotPasswordRedisKey(token), config.forgotPassword.expirationSeconds, email),
                    EmailService.sendResetPasswordEmail(user, token)
                        .catch(err => logger.error(`Failed to send 'Forgot password' email`, err))
                ]
            })
            .return('OK');
    },
    /**
     * @param {String} token
     * @param {String} password
     * @return {Promise.<String,Error>}
     */
    resetPassword: (token, password) => {
        if (typeof token !== 'string') {
            return Promise.reject(boom.badData(`Forgot Password Reset: missing token`));
        }
        if (typeof password !== 'string') {
            return Promise.reject(boom.badData(`Forgot Password Reset: missing password`));
        }
        return redis.getAsync(UserService._generateForgotPasswordRedisKey(token))
            .then(/**String*/redisResult => {
                if (typeof redisResult !== 'string') {
                    throw boom.badData(`Token [${token}] expired or never existed at all`);
                }
                return redisResult;
            })
            .then(/**String*/email => {
                return [
                    User.find({where: {email}})
                        .then(/**Instance.<User>*/user => {
                            if (!user) {
                                throw boom.notFound(`User not exists`);
                            }
                            return user;
                        }),
                    UserService.encryptPassword(password)
                ]
            })
            .spread((/**Instance.<User>*/user, /**String*/encryptedNewPassword) => {
                return user.update({password: encryptedNewPassword});
            })
            .return('OK');
    },
    /**
     * @param {String}token
     * @return {Promise.<Boolean,Error>}
     */
    verifyEmail: token => {
        if (typeof token !== 'string') {
            return Promise.reject(boom.badData(`Verify email token is missing or invalid`));
        }
        return redis.getAsync(token)
            .then(email => {
                if (!email) {
                    throw boom.notFound(`Invalid token`);
                }
                return [
                    User.update({emailVerified: true}, {where: {email}}),
                    redis.delAsync(token)
                ]
            })
            .spread((updateResults, redisResponse) => updateResults[0] > 0)
    },
    /**
     * @param {String}token
     * @private
     * @return {String}
     */
    _generateForgotPasswordRedisKey: token => `forgot-password:${token}`,
    /**
     * @param {String}password
     * @return {Promise.<String,Error>}
     */
    encryptPassword: password => bcrypt.genSaltAsync(config.auth.rounds).then(salt => bcrypt.hashAsync(password, salt)),
    /**
     * @param {String} payload.businessName
     * @param {String} payload.email
     * @param {String} payload.password
     * @param {String} payload.type
     */
    _validateCreateUser: payload => {
        let errors = {},
            validations = {
                email: email => {
                    if (typeof email !== 'string' || email.trim().length === 0){
                        return 'Missing email';
                    }
                    let re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                    if (!re.test(email)) {
                        return 'Email address is not valid';

                    }
                    return false;
                },
                password: password => (typeof password !== 'string' || password.trim().length === 0) ? 'Missing password' : false,
                type: type => (!(RoleService.hasUserRole(type)) ? 'Missing role' : false)
            };
        Object.keys(validations).forEach(validation => {
            if (!payload[validation]) {
                errors[validation] = `Missing ${validation} field`;
            } else {
                let isInvalid = validations[validation](payload[validation]);
                if (isInvalid) {
                    errors[validation] = isInvalid;
                }
            }
        });
        //if there is invalid email, we can't process with validation any further
        if (!_.isEmpty(errors)) {
            return Promise.reject(Utils.validationError(errors));
        }
        return User.unscoped().count({where: {email: payload.email}})
            .then(/**Number*/existingEmailsCount => {
                if (existingEmailsCount !== 0) {
                    errors.email = `Email [${payload.email}] already taken`;
                    throw Utils.validationError(errors);
                }
                Promise.resolve(payload);
            })
    },
    /**
     *
     * @param {Object}payload
     * @param {Instance.<User>}user
     * @return {Promise.<boolean,Error>}
     * @private
     */
    _validateUpdateUser: (payload, user) => {
        let props = {},
            errors = {};
        if (payload.email) {
            props.email = User.count({where: {email: payload.email, id: {$ne: user.id}}})
                .then(count => {
                    if (count !== 0) {
                        errors.email = 'Email already taken';
                    }
                })
        }
        if (payload.password) {
            if (!payload.oldPassword) {
                errors.oldPassword = 'Old password is required to proceed';
            } else {
                props.oldPassword = bcrypt.compareAsync(payload.oldPassword, user.password)
                    .then(isSame => {
                        if (!isSame) {
                            errors.oldPassword = `Invalid password`;
                        }
                    })
            }
        }
        return Promise.props(props)
            .then(() => {
                if (Object.keys(errors).length !== 0) {
                    throw Utils.validationError(errors);
                }
            })
    }
};
module.exports = UserService;
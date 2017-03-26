'use strict';
/**
 * @typedef {Object} AuthResult
 * @property {String} token - authentication token
 * @property {Number} expiresIn - expiration period in seconds
 * @property {String|UUID} userId
 * @property {String} domain
 */
const
    _ = require('lodash'),
    Promise = require('bluebird'),
    boom = require('boom'),
    bcrypt = Promise.promisifyAll(require('bcryptjs')),
    validator = require('validator'),
    jwt = require('jsonwebtoken'),
    config = require('./../../config/config'),
    logger = require('./../../config/log'),
    models = require('./../../models'),
    {User} = models;

let SessionService = {
    /**
     * Method that accepts login and password, and returns signed JWT token, is provided credentials are valid
     * @param {String} email
     * @param {String}password
     * @return {Promise.<AuthResult,Error>}
     */
    authenticate: (email, password)=> {
        if (_.isEmpty(email)) {
            return Promise.reject(boom.badRequest("Email can not be empty"));
        }
        if (_.isEmpty(password)) {
            return Promise.reject(boom.badRequest("Password can not be empty"));
        }
        return User.scope('auth').findOne({where: {email: email}})
            .then(/**Instance.<User>*/user=> {
                if (!user) {
                    throw boom.unauthorized(`User with email ${email} not found`);
                }
                return [user, password == user.password || bcrypt.compareAsync(password, user.password), SessionService.generateToken(user)];
            })
            .spread((/**Instance.<User>*/user, /**bool*/comparisonResult, /**AuthResult*/token)=> {
                if (!comparisonResult) {
                    throw boom.unauthorized("Login and password mismatch!");
                }
                return token;
            })
            .catch(err=> {
                logger.error(`Failed to authenticate user [${email}]`, err);
                throw err;
            });
    },

    /**
     * Generate signed JWT token by provided user object
     * @param {Instance.<User>} user
     * @return {Promise.<AuthResult,Error>}
     */
    generateToken: (user) => {
        if (_.isEmpty(user)) {
            return Promise.reject(boom.badRequest("User can not be empty"));
        }
        return Promise.resolve({
            token: jwt.sign(
                {
                    user: SessionService._cleanUser(user)
                },
                config.auth.key,
                config.auth.options
            ),
            expiresIn: config.auth.options.expiresIn,
            domain: `${config.publicServerName}.${config.domainName}`,
            userId: user.id
        })
            .catch(error => {
                logger.error(error);
                throw  error;
            });
    },
    /**
     * @param {Instance.<User>|User}user
     * @return {Object}
     * @private
     */
    _cleanUser: user=> {
        let fieldsToSkip = ['created_at', 'createdAt', 'updated_at', 'updatedAt'];
        return JSON.parse(JSON.stringify(user.toJSON(), (key, value)=>fieldsToSkip.indexOf(key) !== -1 ? void(0) : value))
    },
    /**
     * @param {String|UUID}userId
     * @return {Promise.<AuthResult,Error>}
     * @see SessionService.generateToken
     */
    refreshTokenFor: userId=> {
        if (!userId || !validator.isUUID(userId)) {
            return Promise.reject(boom.badData(`User ID [${userId}] is not a valid UUID`));
        }
        return User.scope('auth').findById(userId)
            .then(SessionService.generateToken)
            .catch(error => {
                logger.error(error);
                throw  error;
            })
    }

};

module.exports = SessionService;
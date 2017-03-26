'use strict';
const
    _ = require('lodash'),
    validator = require('validator'),
    Promise = require('bluebird'),
    boom = require('boom'),
    /**@type {Object.<String,Model>}*/
    models = require('../../models'),
    /**@type {Model<Role>}*/
    RoleModel = models["Role"],
    Utils = require('../../utils/utils');

let RoleService = {

    findRoleByName: (roleName)=> {
        return RoleModel.findOne({where: {name: {$iLike: roleName}}})
            .then(result => {
                if (!result) {
                    throw boom.notFound(`No Role with name [${roleName}] found`);
                }
                return result;
            });
    },

    /**
     * @param {Number} [query.limit]
     * @param {Number} [query.offset]
     * @param {String[]} [query.order]
     * @return {Promise.<Instance<Role>[],Error>}
     */
    getAll: query=> {
        let params = {where: {}};
        _.has(query, 'limit') && (params.limit = query.limit);
        _.has(query, 'offset') && (params.offset = query.offset);
        _.has(query, 'order') && Array.isArray(query.order) && (params.order = [query.order]);
        return model.findAll(params);
    },
    /**
     * @param {String|UUID}data.id
     * @param {String[]} [data.include]
     * @return {Promise.<Instance<Role>,Error>}
     */
    getById: data=> {
        if (!data) {
            return Promise.reject(boom.badData(`Role GetById: missing params object`));
        }
        if (!validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Role ID [${data.id}] is not a valid UUID`));
        }
        let options = {},
            includes = Utils.convertIncludes(data.include, RoleModel);

        if (includes.length > 0) {
            options.include = includes;
        }
        return RoleModel.findById(data.id, options)
    },
    /**
     * @param {Object} payload
     * @return {Promise.<Instance<Role>,Error>}
     */
    create: (payload)=> {
        return RoleService._validate(payload)
            .then(data=> {
                return model.create(data);
            })
    },
    /**
     * @param {Object} payload
     * @param {String|UUID} roleId
     * @return {Promise.<Instance<Role>,Error>}
     */
    update: (payload, roleId)=> {
        if (!validator.isUUID(roleId)) {
            return Promise.reject(boom.badData(`Role ID [${roleId}] is not a valid UUID`));
        }
        return RoleService._validate(payload, roleId)
            .then(data=> {
                return model.findById(roleId)
                    .then(role=> {
                        if (!role) {
                            throw boom.notFound(`No Role with ID [${roleId}] found`);
                        }
                        return role.update(data);
                    })
            })
    },
    /**
     * @param {String|UUID}roleId
     * @return {Promise.<Instance<Role>,Error>}
     */
    delete: roleId=> {
        if (!validator.isUUID(roleId)) {
            return Promise.reject(boom.badData(`Role ID [${roleId}] is not a valid UUID`));
        }
        return model.findById(roleId)
            .then(role=> {
                if (!role) {
                    throw boom.notFound(`No Role with ID [${roleId}] found`);
                }
                return role.destroy()
                    .then(()=>role);
            })
    },

    /**
     * @param {Object}payload
     * @param {String|UUID}[roleId]
     * @return {Promise.<{}>}
     */
    _validate : (payload, roleId)=> {
        let ignoredFields = ['id', 'createdAt', 'updatedAt'];
        //filtering data in payload - picking only declared properties, and omitting `system` properties
        let errors = {};
        if (_.isEmpty(data.name)) {
            errors.content = `Role name cannot be empty`;
        }
        if (_.isEmpty(roleId)) {
            if (!validator.isUUID(payload.userId)) {
                errors.authorId = `Role userId is missing or invalid`;
            }
        }
        if (Object.keys(errors).length > 0) {
            let validationError = boom.badRequest(`Validation error.`);
            validationError.output.payload.details = errors;
            return Promise.reject(validationError);
        }
        return Promise.resolve(data);
    },

    usersRoles: new Set(['bank', 'client']),

    hasUserRole: (/**String*/role) =>{
        if(typeof role !== 'string'){
            return false;
        }else{
            return RoleService.usersRoles.has(role.toLowerCase());
        }
    }

};


module.exports = RoleService;
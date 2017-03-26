'use strict';
const
    Promise = require('bluebird'),
    boom = require('boom'),
    validator = require('validator'),
    _ = require('lodash'),
    config = require('./../../config/config'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    /**@type {Model.<Image>}*/
    model = models['Credit'];

const CreditService = {
    /**
     * @param {String|UUID}data.id
     * @param {sequelize.Association[]}data.include
     * @return {Promise.<Instance.<Image>,Error>}
     */
    getById: data=> {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Get Credit by ID: missing params object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Get Credit by ID: Image ID [${data.id}] is not a valid UUID`));
        }
        let query = {
            where: {client_id: data.id},
            include: data.include
        };
        return model.findAll(query);
    },
    setBidByClientId: data=> {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Get Credit by ID: missing params object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Get Credit by ID: Image ID [${data.id}] is not a valid UUID`));
        }
        let query = {
            bid: data.bid,
            client_id: data.id
        };
        return model.create(query);
    },
    setCreditStatus: data=> {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Get Credit by ID: missing params object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Get Credit by ID: Image ID [${data.id}] is not a valid UUID`));
        }
        let status = {approved: data.approved};
        let where = {
            where: {id: data.id},
        };
        return model.update(status, where);
    },
    getAll: () => {
        return model.findAll({
        });
    }
};

module.exports = CreditService;
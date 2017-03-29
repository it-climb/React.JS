'use strict';
const
    Promise = require('bluebird'),
    boom = require('boom'),
    validator = require('validator'),
    _ = require('lodash'),
    config = require('./../../config/config'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    Utils = require('./../../utils/utils'),
    /**@type {Model.<Image>}*/
    model = models['Credit'];

const CreditService = {
    /**
     * @param {String|UUID}data.id
     * @param {sequelize.Association[]}data.include
     * @return {Promise.<Instance.<Image>,Error>}
     */
    // getByClientId: data=> {
    //     if (typeof data !== 'object') {
    //         return Promise.reject(boom.badData(`Get Credit by ID: missing params object`));
    //     }
    //     if (!data.id || !validator.isUUID(data.id)) {
    //         return Promise.reject(boom.badData(`Get Credit by ID: Image ID [${data.id}] is not a valid UUID`));
    //     }
    //     let query = {
    //         where: {client_id: data.id},
    //         include: data.include
    //     };
    //     return model.find(query);
    // },
    getByClientId: clientId => {
        // if (typeof data !== 'object') {
        //     return Promise.reject(boom.badData(`Get Credits by ClientID: missing params object`));
        // }
        if (!clientId || !validator.isUUID(clientId)) {
            return Promise.reject(boom.badData(`Get Credits by ClientID: Image ID [${data.clientId}] is not a valid UUID`));
        }
        let query = {where: {clientId: clientId}};
            // includes = data.include;
        // if (includes.length > 0) {
        //     query.include = includes;
        // }
        return model.findAll(query);
    },
    getByBankId: bankId => {
        // if (typeof data !== 'object') {
        //     return Promise.reject(boom.badData(`Get Credits by ClientID: missing params object`));
        // }
        if (!bankId || !validator.isUUID(bankId)) {
            return Promise.reject(boom.badData(`Get Credits by bankId: Image ID [${data.bankId}] is not a valid UUID`));
        }
        let query = {where: {bankId: bankId}};
            // includes = data.include;
        // if (includes.length > 0) {
        //     query.include = includes;
        // }
        return model.findAll(query);
    },
    // setBidByClientId: data => {
    //     if (typeof data !== 'object') {
    //         return Promise.reject(boom.badData(`Get Credit by ID: missing params object`));
    //     }
    //     if (!data.id || !validator.isUUID(data.id)) {
    //         return Promise.reject(boom.badData(`Get Credit by ID: Image ID [${data.id}] is not a valid UUID`));
    //     }
    //     let query = {
    //         bid: data.bid,
    //         client_id: data.id
    //     };
    //     return model.create(query);
    // },
    // setCreditStatus: data => {
    //     if (typeof data !== 'object') {
    //         return Promise.reject(boom.badData(`Get Credit by ID: missing params object`));
    //     }
    //     if (!data.id || !validator.isUUID(data.id)) {
    //         return Promise.reject(boom.badData(`Get Credit by ID: Image ID [${data.id}] is not a valid UUID`));
    //     }
    //     let status = {approved: data.approved};
    //     let where = {
    //         where: {id: data.id},
    //     };
    //     return model.update(status, where);
    // },
    update: data => {
        if (typeof data !== 'object' || typeof data.payload !== 'object') {
            return Promise.reject(boom.badData(`Update Credit:missing payload object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Update Credit : id [${data.id}] is not a valid UUID`));
        }
        let filtered = Utils.filterPayload(data.payload, model, ['id',  'bankId', 'clientId',  'requestDate']);
        // let filtered = {'confirm':data.payload.confirm};
        return model.findById(data.id)
            .then(/**Instance.<Credit>*/credit => {
                if (!credit) {
                    throw boom.notFound(`No Credit with ID [${data.id}] exists`);
                }
                return [credit, validate(filtered, credit.id)];
            })
            .spread(credit => credit.update(filtered));

    },
    updateConfirmById: data => {
        if (!data || typeof data !== 'object') {
            return Promise.reject(boom.badData('Missing payload data'));
        }
        let confirm = {confirm: data.payload.confirm};
        let where = {
            where: {id: data.id},
        };
        return model.update(confirm, where);

    },

    updateConfirm: data => {
        if (!data || typeof data !== 'object') {
            return Promise.reject(boom.badData('Missing payload data'));
        }
        let confirm = {confirm: data.confirm};
        let where = {
            where: {id: data.id},
        };
        return model.update(confirm, where);
    },
    create: payload => {
        if (!payload || typeof payload !== 'object') {
            return Promise.reject(boom.badData('Missing payload data'));
        }
        let {sequelize, Credit} = models;
        return Credit.create({bankId: payload.bankId, clientId: payload.clientId, sum: payload.sum})
            .then(credit=>credit);
    },
    // getAll: () => {
    //     return model.findAll({});
    // }

}

module.exports = CreditService;
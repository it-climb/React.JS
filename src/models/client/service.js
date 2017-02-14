'use strict';
const
    Promise = require('bluebird'),
    boom = require('boom'),
    validator = require('validator'),
    _ = require('lodash'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    Utils = require('./../../utils/utils'),
    PaymentService = require('./../payment/service'),
    /**@type {Model.<Client>}*/
    model = models['Client'];

const ClientService = {
    /**
     * @param {String|UUID}data.id
     * @param {sequelize.Association[]}data.include
     */
    getById: data => {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData('Get Client By Id: missing params object'));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Get Client By Id: [${data.id}] is not a valid UUID`));
        }
        let query = {where: {id: data.id}},
            includes = data.include;

        if (includes.length > 0) {
            query.include = includes;
        }
        return model.find(query);
    },
    /**
     * @param {String|UUID}data.id
     * @param {String}data.stripeToken
     * @param {User} data.auth
     * @return {Promise.<Instance.<Client>,Error>}
     */
    updateBilling: data => {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Update Client Billing:missing payload object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Update Client Billing: id [${data.id}] is not a valid UUID`));
        }
        if (typeof data.auth !== 'object') {
            return Promise.reject(boom.badData(`Update Client Billing:missing auth data`));
        }
        return model.scope('withUser').findById(data.id)
            .then(/**Instance.<Client>*/client => {
                if (!client) {
                    throw boom.notFound(`Client with ID [${data.id}] not exists`);
                }
                return PaymentService.updateCustomer(client, undefined, data.auth);
            })
    },
    /**
     * @param {String|UUID}id
     * @return {Promise.<Object,Error>}
     */
    getBillingData: id => {
        return PaymentService.getBillingDataFor(id, model);
    },
    /**
     * @param {String|UUID}data.id
     * @param {Object.<String,*>} data.payload
     * @return {Promise.<Instance.<Client>,Error>}
     */
    update: data => {
        if (typeof data !== 'object' || typeof data.payload !== 'object') {
            return Promise.reject(boom.badData(`Update Client:missing payload object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Update Client : id [${data.id}] is not a valid UUID`));
        }
        let filtered = Utils.filterPayload(data.payload, model, ['id', 'createdAt', 'updatedAt', 'User', 'Cases', 'billingData', 'userId', 'completedJobs']);
        return model.findById(data.id)
            .then(/**Instance.<Client>*/client => {
                if (!client) {
                    throw boom.notFound(`No Client with ID [${data.id}] exists`);
                }
                return [client, validate(filtered, client.id)];
            })
            .spread(client => client.update(filtered));

    }
};

function validate(payload, id) {
    let validations = {
        //example
        'userId': userId => {
            return Promise.resolve(userId)
                .then(userId => {
                    if (!userId) {
                        throw boom.expectationFailed(`Field [userId] must be not empty.`)
                    }
                })
        }
    };
    return Promise.props(Object.keys(validations).filter(key => _.has(payload, key)).map(key => validations[key](_.get(payload, key))));
}

module.exports = ClientService;
'use strict';
const
    Promise = require('bluebird'),
    boom = require('boom'),
    validator = require('validator'),
    _ = require('lodash'),
    logger = require('./../../config/log'),
    EmailService = require('./../email/service'),
    PaymentService = require('./../payment/service'),
    Utils = require('./../../utils/utils'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    /**@type {Model.<Bank>}*/
    model = models['Bank'];

const BankService = {
    /**
     * @param {String|UUID}data.id
     * @param {sequelize.Association[]} data.include
     * @return {Promise.<Instance.<Bank>,Error>}
     */
    getById: data => {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Bank GetById: missing params object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Bank GetById: [${data.id}] is not a valid UUID`));
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
     * @param {{ip:String,type:String,ua:String}}data.data
     * @return {Promise.<Instance.<Bank>,Error>}
     */
    updateBilling: data => {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Update Bank Billing:missing payload object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Update Bank Billing: id [${data.id}] is not a valid UUID`));
        }
        if (typeof data.auth !== 'object') {
            return Promise.reject(boom.badData(`Update Bank Billing:missing auth data`));
        }
        return model.scope('withUser').findById(data.id)
            .then(/**Instance.<Bank>*/bank => {
                if (!bank) {
                    throw boom.notFound(`Bank with ID [${data.id}] not exists`);
                }
                return PaymentService.updateAccount(bank, undefined, data.auth, data.data);
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
     * @return {Promise.<Instance.<Bank>,Error>}
     */
    update: data => {
        if (typeof data !== 'object' || typeof data.payload !== 'object') {
            return Promise.reject(boom.badData(`Update Bank:missing payload object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Update Bank : id [${data.id}] is not a valid UUID`));
        }
        let filtered = Utils.filterPayload(data.payload, model, ['id', 'createdAt', 'updatedAt', 'billingData', 'Contracts', 'BankRatings', 'Bids', 'userId', 'completedJobs']);
        return model.findById(data.id)
            .then(/**Instance.<Bank >*/bank => {
                if (!bank) {
                    throw boom.notFound(`No Bank with ID [${data.id}] exists`);
                }
                return [bank, validate(filtered, bank.id)];
            })
            .spread(bank => bank.update(filtered));

    },
    /**
     * @param {String}data.businessName
     * @param {sequelize.Association[]} data.include
     * @return {Promise.<Instance.<Bank>,Error>}
     */
    getIdByBusinessName: data => {
        console.log("bank servicejs getIdByBusinessName 98");
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Bank getIdByBusinessName: missing params object`));
        }
        if (!data.businessName || !validator.isString(data.businessName)) {
            return Promise.reject(boom.badData(`Bank getIdByBusinessName: [${data.businessName}] is not a valid VARCHAR`));
        }
        let query = {where: {businessName: data.businessName}},
            includes = data.include;

        if (includes.length > 0) {
            query.include = includes;
        }
        return model.find(query);
    },

    getAllBusinessNames: () => {
        console.log("bank servicejs getAllBusinessNames 115");
        return model.findAll({
            attributes: ["id", "business_name"]
        });
    },
    getAll: () => {
        console.log("bank servicejs getAll 121");
        return model.findAll({
        });
    }
};

function validateRating(rating) {
    if (!Array.isArray(rating)) {
        throw Utils.validationError({errors: {rating: 'Malformed rating JSON'}});
    }
    let isValid = rating.reduce((isValid, elem) => {
        let keys = Object.keys(elem);
        if (keys.length !== 2) {
            return false;
        }
        return isValid && (typeof elem.type === 'string') && (typeof elem.value === 'number') && (elem.value >= 0 && elem.value <= 5);
    }, true);
    if (!isValid) {
        throw Utils.validationError({errors: {rating: 'Malformed rating JSON'}});

    }
}

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

module.exports = BankService;
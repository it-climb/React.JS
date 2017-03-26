'use strict';
/**@typedef {{line1:String,line2:String,state:String,city:String,postal_code:String}} stripe.Location*/
const
    Promise = require('bluebird'),
    _ = require('lodash'),
    boom = require('boom'),
    moment = require('moment'),
    validator = require('validator'),
    config = require('./../../config/config'),
    logger = require('./../../config/log'),
    EmailService = require('./../email/service'),
    Utils = require('./../../utils/utils'),
    models = require('./../../models');

let PaymentService = {
    /**
     * @param {Instance.<Client|Bank>}model
     * @param {String}stripeToken
     * @param {User} auth
     * @return {Promise.<Instance.<Client|Bank>,Error>}
     */
    updateCustomer: (model, stripeToken, auth) => {
        if (!model || typeof model !== 'object') {
            return Promise.reject(boom.expectationFailed(`Can't update billing data: Missing target entity`));
        }
        /**@type {String}*/
        let modelName = _.get(model, 'Model.name');
        if (['Bank', 'Client'].indexOf(modelName) === -1) {
            return Promise.reject(boom.expectationFailed(`Can't update billing data: entity [${modelName}] is not allowed`));
        }
        if (!Utils.isStripeToken(stripeToken)) {
            return Promise.reject(boom.badRequest(`Stripe token [${stripeToken}] is missing or invalid`));
        }
        let /**String*/ stripeCustomerId = _.get(model, 'billingData.customer.id');

        let basicStripeCustomer = {
            description: `Customer for ${modelName} [${model.id}]`,
            email: auth.email,
            metadata: {
                entity: modelName,
                id: model.id,
                userId: auth.id,
            },
            source: stripeToken,
        };

        return (
            !!stripeCustomerId
                ? stripe.customers.update(stripeCustomerId, basicStripeCustomer)
                : stripe.customers.create(basicStripeCustomer)
        )
            .then(customer => model.update({billingData: _.merge(model.billingData, {customer}), hasBilling: true}))
    },
    /**
     * @param {Instance.<Client|Bank>}model
     * @param {String}stripeToken
     * @param {User} auth
     * @param {{ip:String,type:String,ua:String}}data
     * @return {Promise.<Instance.<Client|Bank>,Error>}
     */
    updateAccount: (model, stripeToken, auth, data) => {
        if (!model || typeof model !== 'object') {
            return Promise.reject(boom.expectationFailed(`Can't update billing data: Missing target entity`));
        }
        /**@type {String}*/
        let modelName = _.get(model, 'Model.name');
        if (['Bank', 'Client'].indexOf(modelName) === -1) {
            return Promise.reject(boom.expectationFailed(`Can't update billing data: entity [${modelName}] is not allowed`));
        }
        let accountHolderName = _.trim(data.account_holder_name).split(' ');
        let dob = moment(_.get(model, 'settings.dob') || data.dob),
            basicStripeAccount = {
                business_name: model.businessName,
                business_url: `https://${config.publicServerName}.${config.domainName}/${modelName.toLowerCase()}s/${model.id}`,
                default_currency: 'usd',
                email: auth.email,
                legal_entity: {
                    address: {
                        country: 'US'
                    },
                    business_name: model.businessName,
                    first_name: accountHolderName[0] || auth.firstName,
                    last_name: accountHolderName[1] || auth.lastName,
                    type: 'company', //FIXME hard coded
                    dob: {
                        day: dob.date(),
                        month: dob.month()+1,
                        year: dob.year()
                    },
                    ssn_last_4: data.ssn_last_4,
                    business_tax_id: data.business_tax_id
                },
                tos_acceptance: {
                    date: ~~(new Date(model.createdAt) / 1000),
                    ip: data.ip,
                    user_agent: data.ua
                },
                transfer_schedule: {
                    delay_days: 2,
                    interval: 'daily'
                },
                metadata: {
                    entity: model.Model.name,
                    id: model.id
                }
            };
        return (!!stripeAccountId
                ? stripe.accounts.update(stripeAccountId, basicStripeAccount)
                : stripe.accounts.create(Object.assign(basicStripeAccount, {
                managed: true,
                country: 'US',
                product_description: `Account for ${model.Model.name} ${model.id}`
            }))
        )
            .then(stripeAccount => {
                let existingAccountsCount = stripeAccount.external_accounts.data.length,
                    externalAccountId = existingAccountsCount === 0 ? null : stripeAccount.external_accounts.data[0].id;
                return [
                    stripeAccount,
                    stripe.account.createExternalAccount(stripeAccount.id, {
                        external_account: stripeToken,
                        default_for_currency: true
                    }),
                    externalAccountId
                ];
            })
            .spread((stripeAccount, newExternalAccount, oldExternalAccountId) => {
                return [
                    stripeAccount,
                    newExternalAccount,
                    oldExternalAccountId !== null && stripe.accounts.deleteExternalAccount(stripeAccount.id, oldExternalAccountId)
                ]
            })
            .spread((stripeAccount, newExternalAccount) => {
                stripeAccount.external_accounts.data = [newExternalAccount];
                stripeAccount.external_accounts.total_count = 1;
                let account = _.merge(model.billingData.account, stripeAccount);
                return model.update({billingData: _.merge(model.billingData, {account}), hasBilling: true});
            })
    },
    /**
     * @param {Instance.<Contract>}contract
     * @param {User}auth
     * @return {Promise.<Instance.<Contract>,Error>}
     */

    getBillingDataFor: (id, model) => {
        if (!model || ['Bank', 'Client'].indexOf(model.name) === -1) {
            return Promise.reject(boom.badData(`Get Billing Data: missing or invalid model`));
        }
        if (!id || !validator.isUUID(id)) {
            return Promise.reject(boom.badData(`Get Billing data: ${model.name} ID [${id}] is not a valid UUID`));
        }
        let {sequelize} = model;
        return sequelize.query(
            `SELECT billing_data FROM ${model.tableName} WHERE id=:id`,
            {replacements: {id}, type: sequelize.QueryTypes.SELECT}
        )
            .then(/**Object[]*/rawResults => {
                if (rawResults.length !== 1) {
                    throw boom.badData(`No billing data for ${model.name} [${id}]`);
                }
                return rawResults[0].billing_data;
            })
    }
};

module.exports = PaymentService;
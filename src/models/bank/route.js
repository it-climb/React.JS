'use strict';
const
    boom = require('boom'),
    BankService = require('./service'),
    logger = require('./../../config/log'),
    Utils = require('./../../utils/utils'),
    path = 'banks';

module.exports = [
    {
        method: 'PUT',
        path: `/${path}/{id}/billing`,
        config: {
            auth: 'token',
            plugins: {
                joinTarget: 'Bank',
                policies: ['canUpdateBank']
            }
        },
        handler: (request, reply)=> {
            let {id} = request.params,
                {stripeToken} = request.payload,
                {data} = request.payload,
                auth = request.auth.credentials;
                data = Object.assign(data,{ip:Utils.getIP(request),ua:request.headers['user-agent']});
            BankService.updateBilling({id, stripeToken, auth, data})
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to update billing for Bank [${id}]`, err);
                    reply(boom.wrap(err,err.type==='StripeCardError'?err.statusCode:500,err.message));
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}/{id}/billing`,
        config: {
            auth: 'token',
            plugins: {
                policies: ['canUpdateBank']
            }
        },
        handler: (request, reply)=> {
            let {id} = request.params;
            BankService.getBillingData(id)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to load billingData for Bank ${id}`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}/businessNames`,
        config: {
            auth: false
        },
        handler: (request, reply)=> {
            BankService.getAllBusinessNames()
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to load getAllBusinessNames for Bank`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}`,
        config: {
            auth: false
        },
        handler: (request, reply)=> {
            BankService.getAll()
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to load getAllBusinessNames for Bank`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'PUT',
        path: `/${path}/{id}`,
        config: {
            auth: 'token',
            plugins: {
                joinTarget: 'Bank',
                policies: ['canUpdateBank']
            }
        },
        handler: (request, reply)=> {
            let {id} = request.params,
                {payload} = request;
            BankService.update({id, payload})
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to update Bank [${id}]`, err);
                    reply(err);
                })


        }
    }
];
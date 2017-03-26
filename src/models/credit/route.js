'use strict';
const
    boom = require('boom'),
    CreditService = require('./service'),
    logger = require('./../../config/log'),
    Utils = require('./../../utils/utils'),
    path = 'credits';

module.exports = [
    {
        method: 'PUT',
        path: `/${path}/{id}`,
        config: {
            auth: 'token'
        },
        handler: (request, reply)=> {
            let {id} = request.params,
                {credit} = request.payload,
                auth = request.auth.credentials;
            CreditService.update({id, credit, auth})
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to update billing for Credit [${id}]`, err);
                    reply(boom.wrap(err,err.type==='StripeCardError'?err.statusCode:500,err.message));
                })
        }
    },
    // {
    //     method: 'GET',
    //     path: `/${path}/{id}`,
    //     config: {
    //         auth: false
    //         // auth: 'token'
    //     },
    //     handler: (request, reply)=> {
    //         let {id} = request.params;
    //         CreditService.getById(id)
    //             .then(reply)
    //             .catch(err=> {
    //                 logger.warn(`Failed to load billingData for Bank ${id}`, err);
    //                 reply(err);
    //             })
    //     }
    // },
    // {
    //     method: 'GET',
    //     path: `/${path}/{clientId}/{bankId}`,
    //     config: {
    //         auth: false
    //         // auth: 'token'
    //     },
    //     handler: (request, reply)=> {
    //         let {clientId, bankId} = request.params;
    //         CreditService.getByClientId(clientId, bankId)
    //             .then(reply)
    //             .catch(err=> {
    //                 logger.warn(`Failed to load getByBankId for Credits ${bankId}`, err);
    //                 reply(err);
    //             })
    //     }
    // },
    {
        method: 'POST',
        path: `/${path}`,
        config: {
            auth: false
        },
        handler: (request, reply) => {
            CreditService.create(request.payload)
                .then(reply)
                .catch(err => {
                    logger.warn('Failed to create credid', err);
                    reply(err);
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}`,
        config: {
            auth: false
            // auth: 'token'
        },
        handler: (request, reply)=> {
            CreditService.getAll()
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to load credits All`, err);
                    reply(err);
                })
        }
    }

    // {
    //     method: 'PUT',
    //     path: `/${path}/{id}`,
    //     config: {
    //         auth: false
    //         // auth: 'token'
    //     },
    //     handler: (request, reply)=> {
    //         let {id} = request.params,
    //             {payload} = request;
    //         CreditService.update({id, payload})
    //             .then(reply)
    //             .catch(err=> {
    //                 logger.warn(`Failed to update Credit [${id}]`, err);
    //                 reply(err);
    //             })
    //
    //
    //     }
    // }
];
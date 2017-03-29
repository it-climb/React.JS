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
            auth: false
        },
        handler: (request, reply)=> {
            let {id} = request.params,
                {payload} = request;
            CreditService.update({id, payload})
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to update  for Credit [${id}]`, err);
                    reply(boom.wrap(err,err.type==='StripeCardError'?err.statusCode:500,err.message));
                })
        }
    },
    {
        method: 'PUT',
        path: `/${path}/{id}/confirm`,
        config: {
            auth: false
        },
        handler: (request, reply)=> {
            let {id} = request.params,
                {payload} = request;
            CreditService.updateConfirmById({id, payload})
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to update  for Credit [${id}]`, err);
                    reply(boom.wrap(err,err.type==='StripeCardError'?err.statusCode:500,err.message));
                })
        }
    },
    {
        method: 'PUT',
        path: `/${path}/confirm`,
        config: {
            auth: false
        },
        handler: (request, reply)=> {
            // let {data} = request.payload;
            CreditService.updateConfirm(request.payload)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to update  for Credit `, err);
                    reply(boom.wrap(err,err.type==='StripeCardError'?err.statusCode:500,err.message));
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}/{clientId}`,
        config: {
            auth: false
            // auth: 'token'
        },
        handler: (request, reply)=> {
            let {clientId} = request.params;
            // let {include} = request;
            CreditService.getByClientId(clientId)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to load for client ${clientId}`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}/{bankId}/bank`,
        config: {
            auth: false
            // auth: 'token'
        },
        handler: (request, reply)=> {
            let {bankId} = request.params;
            // let {include} = request;
            CreditService.getByBankId(bankId)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to load for bankId ${bankId}`, err);
                    reply(err);
                })
        }
    },
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
                    logger.warn('Failed to create credit', err);
                    reply(err);
                })
        }
    },
    // {
    //     method: 'GET',
    //     path: `/${path}`,
    //     config: {
    //         auth: false
    //         // auth: 'token'
    //     },
    //     handler: (request, reply)=> {
    //         CreditService.getAll()
    //             .then(reply)
    //             .catch(err=> {
    //                 logger.warn(`Failed to load credits All`, err);
    //                 reply(err);
    //             })
    //     }
    // }

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
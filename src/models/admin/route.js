'use strict';
const
    AdminService = require('./service'),
    path = 'admin';

module.exports = [
    {
        method: 'GET',
        path: `/${path}/stats`,
        config: {
            auth: false
        },
        handler: (request, reply) => {
            AdminService.getStats(request.query.period)
                .then(reply)
                .catch(err => {
                    console.log(err);
                    reply(err);
                })
        }
    }
];
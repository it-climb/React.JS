'use strict';
'use strict';
const
    SessionService = require('./service'),
    boom = require('boom'),
    logger = require('./../../config/log'),
    path = 'sessions';

module.exports = [
    {
        method: 'POST',
        path: `/${path}`,
        config: {
            auth: false
        },
        handler: (request, reply)=> {
            SessionService.authenticate(request.payload.email, request.payload.password)
                .then(/**AuthResult*/token=> {
                    if (!token.token) {
                        throw boom.internal('Missing fields in authentication results');
                    }
                    reply(token).state('access_token', token.token)
                })
                .catch(err=> {
                    logger.error('Authentication Failure', err);
                    reply(err);
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}`,
        config: {
            auth: 'token'
        },
        handler: (request, reply)=> {
            reply({userId: request.auth.credentials.id});
        }
    },
    {
        method:'GET',
        path:`/${path}/logout`,
        config:{
            auth:false
        },
        handler:(request,reply)=>{
            return reply().unstate('access_token').redirect('/');
        }
    }
];
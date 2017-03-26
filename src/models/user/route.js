'use strict';
const
    logger = require('./../../config/log'),
    models = require('./../../models'),
    UserService = require('./service'),
    {User} = models,
    path = 'users';
module.exports = [
    {
        method: 'GET',
        path: `/${path}/me`,
        config: {
            auth: 'token',
            plugins: {
                joinTarget: 'User'
            }
        },
        handler: (request, reply) => {

            let {id} = request.auth.credentials,
                {include} = request;
            UserService.getById({id, include})
                .then(reply)
                .catch(err => {
                    logger.warn(`Failed to fetch User by ID [${id}]`, err);
                    reply(err);
                });
        }
    },
    {
        method: 'PUT',
        path: `/${path}/{id}`,
        config: {
            auth: 'token',
            plugins: {
                policies: ['canEditUser'],
                refreshToken: true
            }
        },
        handler: (request, reply) => {
            let {id} = request.params;
            UserService.update(id, request.payload)
                .then(reply)
                .catch(err => {
                    logger.warn(`Failed to updated user [${id}]`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'POST',
        path: `/${path}`,
        config: {
            auth: false
        },
        handler: (request, reply) => {
            UserService.create(request.payload)
                .then(reply)
                .catch(err => {
                    logger.warn('Failed to register user', err);
                    reply(err);
                })
        }
    },
    {
        method: 'POST',
        path: `/${path}/forgot-password`,
        config: {
            auth: false
        },
        handler: (request, reply) => {
            let {email} = request.payload;
            UserService.generateForgotPasswordToken(email)
                .then(reply)
                .catch(err => {
                    logger.warn(`Failed to generate 'Forgot Password' token for [${email}]`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'POST',
        path: `/${path}/forgot-password-reset`,
        config: {
            auth: false,
        },
        handler: (request, reply) => {
            let {token, password}=request.payload;
            UserService.resetPassword(token, password)
                .then(reply)
                .catch(err => {
                    logger.warn(`Failed to reset forgotten password`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'POST',
        path: `/${path}/verify-email`,
        config: {
            auth: false,
            plugins:{
                refreshToken:true
            }
        },
        handler: (request, reply) => {
            let {token} = request.payload;
            UserService.verifyEmail(token)
                .then(reply)
                .catch(err => {
                    logger.warn(`Failed to verify email`, err);
                    reply(err);
                })
        }
    }
];
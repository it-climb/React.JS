'use strict';

const
    Hapi = require('hapi'),
    server = new Hapi.Server({connections: {router: {stripTrailingSlash: true}}}),
    hapiJWT = require('hapi-auth-jwt2'),
    hapiBell = require('bell'),
    Utils = require('./utils/utils'),
    _ = require('lodash'),
    routes = require('./routes'),
    SessionService = require('./models/session/service'),
    /**@type {Object.<String,Model>}*/
    models = require('./models'),
    config = require('./config/config'),
    logger = require('./config/log');


process.on('uncaughtException', err => {
    logger.error('Unexpected error occurred; Exiting...', err);
    process.exit(666);
});

server.connection({
    host: config.host,
    port: config.port,
    routes: {
        cors: {
            origin: ['*'],
            credentials: true
        }
    }
});

server.ext('onPreResponse', (request, reply)=> {
    //if flag wasn't set in rote configuration, no need to refresh token
    if (!_.get(request, 'route.settings.plugins.refreshToken', false)) {
        return reply.continue();
    }
    let userId = _.get(request, 'auth.credentials.id');
    //is user isn't logged in - no need to refresh token
    if (_.isEmpty(userId)) {
        return reply.continue();
    }
    SessionService.refreshTokenFor(userId)
        .then(token=> {
            reply.state('access_token', token.token);
            reply.continue();
        });
});

server.ext('onPreHandler', (request, reply) => {
    let joinTarget = _.get(request, 'route.settings.plugins.joinTarget', false);
    let include = [];
    if (!!joinTarget && !!models[joinTarget]) {
        include = Utils.convertIncludes(_.trim(request.query.join).split(/,+/), models[joinTarget]);
    }
    request.include = include;
    reply.continue();
});

server.register([hapiJWT, hapiBell], err => {
    if (err) {
        console.log(err);
    }
    server.auth.strategy('token', 'jwt', 'optional', {
        key: config.auth.key,
        /**
         * Function that checks whether credentials in JWT are valid
         * @param {request} request
         * @param {{user:{},iam:number,expiresIn:number}} decodedToken
         * @param {validationCallback} callback
         */
        validateFunc: (decodedToken, request, callback) => {
            callback(null, !!decodedToken.user, decodedToken.user);
        },
        verifyOptions: config.auth.options,
        cookieKey: 'access_token',
        headerKey: 'x-test-auth'
    });
});

server.register({
    register: require('mrhorse'), options: {
        policyDirectory: `${__dirname}/policies`
    }
}, err => {
    if (err) {
        console.log(err);
    }
});
server.register(require('inert'), err => {
});
server.state('access_token', {
    ttl: config.auth.options.expiresIn * 1000,//config contains ttl in seconds, so we need to convert it to milliseconds manually
    path: '/',
    domain: `${config.publicServerName}.${config.domainName}`
});

server.route(routes);
// Start the server
server.start((err) => {
    if (err) {
        logger.error('Failed to start server:', err);
        throw err;
    }
    logger.info('Server started at:', server.info.uri)
});

/**
 * @callback validationCallback
 * @param {Error} error
 * @param {boolean} isLoggedIn
 * @param {Object} credentials
 */

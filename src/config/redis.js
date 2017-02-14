'use strict';
const
    _ = require('lodash'),
    redis = require('redis'),
    Promise = require('bluebird'),
    config = require('./config');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

module.exports = (opts = {}) => redis.createClient(config.redis.port, config.redis.host, _.merge({}, (config.redis.auth ? {auth_pass: config.redis.auth} : {}), opts));

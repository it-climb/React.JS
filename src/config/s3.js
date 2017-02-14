'use strict';
const
    Promise = require('bluebird'),
    pkgcloud = require('pkgcloud'),
    config = require('./config');


module.exports = Promise.promisifyAll(pkgcloud.storage.createClient(config.amazonS3Credentials));

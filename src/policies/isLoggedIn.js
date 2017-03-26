'use strict';
const
    _ = require('lodash');

const isLoggedIn = (request, reply, next) => {
    let userId = _.get(request, 'auth.credentials.id', false);
    return next(null, !!userId, 'Insufficient privileges');
};
module.exports = isLoggedIn;
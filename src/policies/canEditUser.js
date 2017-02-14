'use strict';

const canEditUser = (request, reply, next)=> {
    let user = request.auth.credentials;
    if (!user) {
        return next(null, false, 'Authentication required');
    }
    return next(null, request.params.id === user.id, 'Insufficient privileges');
};

module.exports = canEditUser;


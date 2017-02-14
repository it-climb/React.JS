'use strict';
const
    _ = require('lodash'),
    models = require('./../models'),
    Bank = models['Bank'],
    logger = require('./../config/log'),
    roleCheckRegex = /^(admin|moderator)$/i;


const canUpdateBank = (request, reply, next)=> {

    let user = _.get(request, 'auth.credentials', null),
        {id} = request.params,
        userRole = _.get(user, 'Role.name', '');

    if(roleCheckRegex.test(userRole)){
        return next(null, true);
    }

    if(user.id==id){
        return next(null, true);
    }

    Bank.findOne({where: {userId: user.id, id: id}})
        .then(bank => {
            if(!bank){
                return next(null, false, 'Insufficient privileges');
            }else{
                return next(null, true);
            }
        })
        .catch(err=>{
            logger.warn(`On 'canUpdateClient' error occurred ${err}`);
            return next(null, false, 'Insufficient privileges');
        });


};
module.exports = canUpdateBank;
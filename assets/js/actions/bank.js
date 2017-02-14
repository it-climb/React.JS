'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        'getOne': '/api/banks/:id',
        'update': {method: 'put', url: '/api/banks/:id'},
        'rate': {method: 'post', url: '/api/banks/:id/rate'},
        'updateBilling': {method: 'put', url: '/api/banks/:id/billing'},
        'getBilling': {method: 'get', url: '/api/banks/:id/billing'}
    }
));
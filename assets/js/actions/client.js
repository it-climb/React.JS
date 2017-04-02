'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        'getOne': '/api/clients/:id',
        // 'getAll': '/api/clients',
        'update':{method:'put',url:'/api/clients/:id'},
        'updateBilling':{method:'put',url:'/api/clients/:id/billing'},
        'getBilling':{method:'get',url:'/api/clients/:id/billing'},
        'getAllClients':{method:'get',url:'/api/clients/all'}
    }
));
'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        // 'getOne': '/api/clients/:id',
        'create':{method:'post', url:'/api/credits'},
        // 'update':{method:'put',url:'/api/clients/:id'},
        // 'updateBilling':{method:'put',url:'/api/clients/:id/billing'},
        'getByClientId':{method:'get',url:'/api/credits/:id'},
        'getByBankId':{method:'get',url:'/api/credits/:id/bank'}
    }
));/**
 * Created by oem on 3/19/17.
 */

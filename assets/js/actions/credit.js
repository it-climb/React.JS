'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        // 'getOne': '/api/credits/:id',
        'getAll': '/api/credits',
        'create':{method:'post', url:'/api/credits'},
        'update':{method:'put',url:'/api/credits/:id'},
        'updateConfirmById':{method:'put',url:'/api/credits/:id/confirm'},
        'updateConfirm':{method:'put',url:'/api/credits/confirm'},
        'getByClientId':{method:'get',url:'/api/credits/:id'},
        'getByBankId':{method:'get',url:'/api/credits/:id/bank'}
    }
));/**
 * Created by oem on 3/19/17.
 */
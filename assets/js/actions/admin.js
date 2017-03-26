'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud({
    'getStats':{method:'get',url:'/api/admin/stats'}
}));
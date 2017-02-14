'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        'create': {method: 'post', url: '/api/attachments'},
        'delete': {method: 'delete', url: '/api/attachments/:id'},
    }
));
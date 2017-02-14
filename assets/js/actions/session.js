'use strict';
import RefluxActionsCrud    from '../utils/reflux_actions_crud';
import Promise              from 'bluebird';

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        'getOne': '/api/sessions',
        'create': {method: 'post', url: '/api/sessions'},
        'delete': {method: 'delete', url: '/api/sessions'}
    }
));
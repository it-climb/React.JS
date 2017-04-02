'use strict';
import RefluxActionsCrud from "../utils/reflux_actions_crud";
import Promise from "bluebird";

export default Promise.promisifyAll(RefluxActionsCrud(
    {
        'getOne': '/api/users/:id',
        'getAll': '/api/users',
        'getMe': {method: 'get', url: '/api/users/me'},
        'create': {method: 'post', url: '/api/users'},
        'update': {method: 'put', url: '/api/users/:id'},
        'delete': {method: 'delete', url: '/api/users/:id'},
        'generateForgotPasswordToken': {method: 'post', url: '/api/users/forgot-password'},
        'resetPassword': {method: 'post', url: '/api/users/forgot-password-reset'},
        'verifyEmail': {method: 'post', url: '/api/users/verify-email'}
    }
));

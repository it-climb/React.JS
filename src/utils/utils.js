'use strict';
const
    _ = require('lodash'),
    boom = require('boom');

let Utils = {
    /**
     * @param {String[]}[rawIncludes]
     * @param {Model}targetModel
     * @return {Association[]}
     */
    convertIncludes: (rawIncludes, targetModel) => {
        return _.filter(rawIncludes, include => !_.isEmpty(include))
            .map(/**String*/modelToInclude => targetModel.associations[modelToInclude])
            .filter(/**[Association]*/association => !!association);
    },
    /**
     * @param {String|String[]}rawScopes
     * @param {Model}targetModel
     * @return {String[]}
     */
    convertScopes: (rawScopes, targetModel) => {
        let scopes = rawScopes;
        if (!Array.isArray(rawScopes)) {
            scopes = rawScopes.split(/\s+,\s+/);
        }
        return scopes.map(scopeNameRaw => scopeNameRaw.trim())
            .filter(scopeName => scopeName === 'defaultScope' || _.has(targetModel.options.scopes, scopeName));

    },
    /**
     * @param {Object.<String,*>}data
     * @param {Model} targetModel
     * @param {String[]}fieldsToSkip
     * @param {String[]}fieldsToInclude - fields that will be included even if they're not exist in Model
     * @return {Object.<String,*>}
     */
    filterPayload: (data, targetModel, fieldsToSkip = [], fieldsToInclude = []) => _.omit(_.pick(data, Object.keys(targetModel.attributes).concat(fieldsToInclude)), fieldsToSkip.concat(fieldsToSkip.map(_.snakeCase))),
    /**
     * @param {String}tokenString
     * @return {boolean}
     */
    isStripeToken: tokenString => typeof tokenString === 'string' && /^(b?tok|pii)_[a-zA-Z0-9]{12,}$/.test(tokenString),
    /**
     * @param {Number}length
     * @param {String}chars
     * @return {String}
     */
    randomString: (length, chars) => {
        let mask = '';
        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        let result = '';
        for (let idx = length; idx > 0; --idx) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    },
    /**
     * @param {Error|{error:Object.<String,String>}|Object.<String,String>}error
     * @return {Error}
     */
    validationError: error => {
        let err = boom.badData('Validation Error');
        err.output.payload.details = error;
        return err;
    },
    /**
     * @description Function that tries ot extract boolean value at provided path from request.
     * Returns "true" only if parameter was present and is 'true' (in boolean or string form), otherwise false
     * @param {Request}request
     * @param {String}fieldName
     * @return {boolean}
     */
    getBoolean: (request, fieldName) => {
        let value = _.get(request, fieldName, false);
        return (/^(true|false)$/i.test(value) && /^true$/i.test(value))
    },
    getIP: request => _.get(request, 'x-real-ip', request.info.remoteAddress),


    getWastType: (wastTypeID)=> {
        let wasteTypes = ['Solid', 'Recycling', 'Recycling - Cardboard', 'Roll-Off'];

        return wasteTypes[wastTypeID];
    },

    isEmptyArray: (array)=>{
        return !(Array.isArray(array) && array.length!=0)
    }
};

module.exports = Utils;
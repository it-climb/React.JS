'use strict';
import _ from "lodash";

const CommonUtils = {
    /**
     * @param {{[city]:String,[state]:String}}location
     * @return {string}
     */
    getCommonAddressStringFrom(location = {}) {
        let address = [];
        if (_.trim(location.city).length !== 0) {
            address.push(location.city);
        }
        if (_.trim(location.state).length !== 0) {
            address.push(location.state);
        }
        return address.join(',');
    },
    /**
     * @param {HTMLElement}el
     * @return {boolean}
     */
    isElementInViewport(el){
        let rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    },
    /**
     * @param {String}uuid
     * @return {number}
     */
    renderUUID(uuid){
        return ~~`0x${(uuid || '').slice(-6)}`;
    },
    /**
     * @param {Object}dentist
     * @return {String[]}
     */
    getMissingProfileFieldsFor(dentist){
        const requiredFields = [
            {field: 'name', label: 'Business Name'}, {field: 'User.firstName', label: 'First Name'},
            {field: 'User.lastName', label: 'Last Name'}, {field: 'User.email', label: 'Email Address'},
            {field: 'phone', label: 'Phone'}, {field: 'settings.jobTitle', label: 'Job Title'},
            {field: 'location.line1', label: 'Street Address'}, {field: 'location.city', label: 'City'},
            {field: 'location.state', label: 'State'}, {field: 'location.postal_code', label: 'Postal Code'},
            {field: 'settings.npi', label: 'NPI'}, {field: 'settings.license', label: 'License #'},
            {field: 'settings.speciality', label: 'Speciality'}];
        return requiredFields.filter(field => _.isEmpty(_.get(dentist, field.field))).map(field => field.label);
    },

    bank: {
        accountTypes: ['individual', 'company']
    }
};

export default CommonUtils;
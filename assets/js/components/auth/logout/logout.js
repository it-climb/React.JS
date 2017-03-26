'use strict';
import React from "react";
import cookie   from 'react-cookie';
import urlUtils from './../../../utils/url_utils';

export default React.createClass({
    componentDidMount() {
        let accessToken = cookie.load("access_token"),
            domain = urlUtils.getDomainPrefix();
        if (accessToken) {
            cookie.remove("access_token", {domain: domain});
            cookie.remove("userId", {domain: domain});
            cookie.remove("needChangeEmail", {domain: domain});
        }
        window.location.replace('/');
    },

    render() {
        return null;
    }
});
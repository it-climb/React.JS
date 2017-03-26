'use strict';
import _ from 'lodash';

let urlUtils = {

    getDomainPrefix: () => {
        let host = window.location.host;
        return host.substring(host.indexOf('.'), host.indexOf(':') > 1 ? host.indexOf(':') : host.length);
    },

    parseUrl: (str, data) => {
        return str.replace(/:[a-zA-Z0-9]+/g, function (str) {
            return data[str.substring(1)];
        })
    },

    getAttachmentsUrl(attachment){
        return `http://s3-us-west-2.amazonaws.com/test-attachments/${attachment.path}`
    },

    getImagesUrl(image){
        return `http://s3-us-west-2.amazonaws.com/test-images/${image.path}`
    }


};

export default urlUtils;

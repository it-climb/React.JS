'use strict';
const
    logger = require('./../../config/log'),
    config = require('./../../config/config'),
    ImageService = require('./service'),
    path = 'images';
module.exports = [
    {
        method: 'GET',
        path: `/${path}/{id}`,
        config: {
            auth: false,
            plugins: {
                joinTarget: 'Image'
            }
        },
        handler: (request, reply)=> {
            let {id} = request.params,
                {include} =request;
            ImageService.getById({id, include})
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to fetch Image [${id}]`, err);
                    reply(err);
                });
        }
    },
    {
        method: 'DELETE',
        path: `/${path}/{id}`,
        config: {
            auth: 'token',
            plugins: {
                policies: ['canDeleteImage']
            }
        },
        handler: (request, reply)=> {
            let {id} = request.params;
            ImageService.delete(id)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to delete Image [${id}]`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'POST',
        path: `/${path}`,
        config: {
            auth: 'token',
            payload: {
                maxBytes: config.image.maxFileSize,
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            }
        },
        handler: (request, reply)=> {
            ImageService.create(request.payload)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to upload images`, err);
                    reply(err);
                })
        }
    }
];
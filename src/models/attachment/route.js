'use strict';
const
    AttachmentService = require('./service'),
    logger = require('./../../config/log'),
    config = require('./../../config/config'),
    path = 'attachments';

module.exports = [
    {
        method: 'DELETE',
        path: `/${path}/{id}`,
        config: {
            auth: 'token',
            /*plugins: {
                policies: ['canDeleteAttachment']
            }*/
        },
        handler: (request, reply)=> {
            let {id} = request.params;
            AttachmentService.delete(id)
                .then(reply)
                .catch(err=> {
                    logger.warn(`Failed to delete Attachment [${id}]`, err);
                    reply(err);
                })
        }
    },
    {
        method: 'POST',
        path: `/${path}`,
        config: {
            auth: 'token',
            /*plugins: {
                policies: ['canCreateAttachment']
            },*/
            payload: {
                maxBytes: config.attachment.maxFileSize,
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data'
            }
        },
        handler: (request, reply)=> {
            AttachmentService.create(request.payload)
                .then(reply)
                .catch(err=> {
                    logger.warn('Failed to upload files', err);
                    reply(err);
                })
        }
    },
    {
        method: 'GET',
        path: `/${path}/{id}/download`,
        config: {
            auth: 'token',
            /*plugins: {
                policies: ['canDownloadAttachment']
            }*/
        },
        handler: (request, reply)=> {
            let {id} = request.params;
            AttachmentService.download(id)
                .then(result=> reply(result.stream).header('Content-disposition', `attachment; filename=${result.name}`))
                .catch(err=> {
                    logger.warn(`Failed to download Attachment [${id}]`, err);
                    reply(err);
                })
        }
    }
];
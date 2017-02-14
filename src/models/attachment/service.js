'use strict';
const
    _ = require('lodash'),
    Promise = require('bluebird'),
    boom = require('boom'),
    validator = require('validator'),
    config = require('./../../config/config'),
    s3client = require('./../../config/s3'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    /**@type {Model.<Attachment>}*/
    model = models['Attachment'];

let AttachmentService = {
    /**
     * @param {String|UUID}id
     * @return {Promise.<Instance.<Attachment>,Error>}
     */
    delete: id=> {
        if (!id || !validator.isUUID(id)) {
            return Promise.reject(boom.badData(`Attachment DeleteById:[${id}] is not a valid UUID`));
        }
        return Promise.join(
            model.findById(id),
            s3client.getContainerAsync(config.amazonS3Buckets.attachments)
        )
            .spread((/**Instance.<Attachment>*/attachment, bucket)=> {
                if (!attachment) {
                    throw boom.notFound(`No Attachment with ID [${id}] found`);
                }
                return s3client.removeFileAsync(bucket, attachment.path)
                    .then(()=>attachment.destroy())
                    .return(attachment);
            })
    },

    /**
     * @param {Payload|Payload[]} payload.files
     * @return {Promise.<Instance.<Attachment>[],Error>}
     */
    create: payload=> {
        if (typeof payload !== 'object') {
            return Promise.reject(boom.expectationFailed('Missing payload'));
        }
        let files = _.flatten([payload.files]);
        if (files.length === 0) {
            return Promise.reject(boom.badData('Cannot upload files: missing [files] field with file payload'));
        }
        return Promise.map(files, file=> {
            let size = file._data.byteLength,
                mimeType = file.hapi.headers['content-type'],
                name = file.hapi.filename;
            return models.sequelize.transaction({autocommit: false})
                .then(transaction=> [
                    model.create({
                        path: `/${_.now()}_${name}`,

                        name,
                        size,
                        mimeType
                    }, {transaction}),
                    transaction
                ])
                .spread((attachment, transaction)=> {
                    return new Promise((resolve, reject)=> {
                        let stream = s3client.upload({
                            container: config.amazonS3Buckets.attachments,
                            remote: attachment.path,
                            contentType: mimeType,
                            acl: 'public-read'
                        });
                        stream.on('success', cloudFile=> resolve());
                        stream.on('error', err=>reject(err));
                        file.pipe(stream);
                    })
                        .then(()=>transaction.commit().return(attachment))
                        .catch(err=>transaction.rollback().return(err));
                })

        })
    },
    /**
     * @param {String|UUID}id
     * @return {{stream:Stream,name:String}}
     */
    download: id=> {
        if (!id || !validator.isUUID(id)) {
            return Promise.reject(boom.badData(`Attachment ID [${id}] is not a valid UUID`));
        }
        return model.findById(id)
            .then(/**Instance.<Attachment>*/attachment=> {
                if (!attachment) {
                    throw boom.notFound(`No Attachment with ID [${id}] found`);
                }
                return {
                    stream: s3client.download({container: config.amazonS3Buckets.attachments, remote: attachment.path}),
                    name: attachment.name
                }

            })
    }
};

module.exports = AttachmentService;
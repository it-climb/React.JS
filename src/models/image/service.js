'use strict';
const
    Promise = require('bluebird'),
    boom = require('boom'),
    validator = require('validator'),
    _ = require('lodash'),
    config = require('./../../config/config'),
    s3Client = require('./../../config/s3'),
    /**@type {Object.<String,Model>}*/
    models = require('./../../models'),
    /**@type {Model.<Image>}*/
    model = models['Image'];

const ImageService = {
    /**
     * @param {String|UUID}data.id
     * @param {sequelize.Association[]}data.include
     * @return {Promise.<Instance.<Image>,Error>}
     */
    getById: data=> {
        if (typeof data !== 'object') {
            return Promise.reject(boom.badData(`Get Image by ID: missing params object`));
        }
        if (!data.id || !validator.isUUID(data.id)) {
            return Promise.reject(boom.badData(`Get Image by ID: Image ID [${data.id}] is not a valid UUID`));
        }
        let query = {
            where: {id: data.id},
            include: data.include
        };
        return model.findOne(query);
    },
    /**
     * @param {String|UUID}id
     * @return {Promise.<Instance.<Image>,Error>}
     */
    delete: id=> {
        if (!id || !validator.isUUID(id)) {
            return Promise.reject(boom.badData(`Delete Image by ID: Image ID [${id}] is not a valid UUID`));
        }
        return Promise.join(
            model.findById(id),
            s3Client.getContainerAsync(config.amazonS3Buckets.images)
        )
            .spread((/**Instance.<Image>*/imageToDelete, bucket)=> {
                if (!imageToDelete) {
                    throw boom.notFound(`No Image with ID [${id}] exists`);
                }
                return s3Client.removeFileAsync(bucket, imageToDelete.path)
                    .then(()=>imageToDelete.destroy())
                    .return(imageToDelete);
            })

    },

    /**
     * @param {Payload|Payload[]} payload.files
     * @return {Promise.<Instance.<Image>[],Error>}
     */
    create: payload=> {
        if (typeof payload !== 'object') {
            return Promise.reject(boom.badData(`Create Image: missing payload object`));
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
                        path: `${_.now()}_${name}`,
                        name,
                        alt: name,
                        size,
                        mimeType,
                        type: model.types.LOGO
                    }, {transaction}),
                    transaction
                ])
                .spread((/**Instance.<Image>*/image, /**sequelize.Transaction*/transaction)=> {
                    return new Promise((resolve, reject)=> {
                        let stream = s3Client.upload({
                            container: config.amazonS3Buckets.images,
                            remote: image.path,
                            acl: 'public-read',
                            contentType: mimeType,
                        });
                        stream.on('success', cloudFile=> resolve());
                        stream.on('error', err=>reject(err));
                        file.pipe(stream);
                    })
                        .then(()=>transaction.commit().return(image))
                        .catch(err=>transaction.rollback().return(err));
                })

        })
    }

};

module.exports = ImageService;

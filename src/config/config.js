'use strict';

module.exports = {
    environment: process.env.NODE_ENV || 'development',
    host: process.env.TEST_API_HOST || 'localhost',
    port: process.env.TEST_API_PORT || 3000,
    domainName: process.env.TEST_DOMAIN_NAME,
    publicServerName: process.env.TEST_PUBLIC_SERVER_NAME || 'www',
    apiServerName: process.env.TEST_API_SERVER_NAME || 'api',
    amazonS3Credentials: {
        provider: 'amazon',
        accessKeyId: process.env.AMAZON_S3_KEY_ID,
        accessKey: process.env.AMAZON_S3_KEY
    },
    amazonS3Buckets: {
        images: 'test-images',
        attachments: 'test-attachments'
    },
    auth: {
        key: process.env.TEST_SIGNIN_PRIVATE_KEY || 'Insanely long and ultrasecure test private key goes here!',
        rounds: 10,
        options: {algorithm: 'HS512', expiresIn: 60 * 60 * 24 * 7}
    },
    redis: {
        //FIXME replace with QA redis later
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        auth: process.env.REDIS_AUTH
    },
    forgotPassword: {
        tokenLength: 32,
        expirationSeconds: 24 * 60 * 60
    },
    attachment: {
        maxFileSize: 200 * 1024 * 1024
    },
    image: {
        maxFileSize: 2 * 1024 * 1024
    },
    verifyEmail: {
        tokenLength: 32,
        expirationSeconds: 30 * 24 * 60 * 60
    },
    mail: {
        //FIXME add variables
        user: process.env.TEST_MAIL_USER || '',
        password: process.env.TEST_MAIL_PWD || '',
        server: process.env.TEST_MAIL_SERVER || '',
        port: process.env.TEST_MAIL_PORT || 465,
        from: process.env.TEST_MAIL_FROM || '',

    }
};
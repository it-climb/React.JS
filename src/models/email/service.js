'use strict';
const
    _ = require('lodash'),
    Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    boom = require('boom'),
    mailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    ejs = require('ejs'),
    config = require('./../../config/config'),
    logger = require('./../../config/log'),
    moment = require('moment'),
    Utils = require('./../../utils/utils');

const
    {from} = config.mail;

const
    Admin = {
        email : 'admin@admin.com',
    };
class EmailService {
    /**
     * @param {Instance.<User>}user
     * @param {String}token
     * @return {Promise.<*,Error>}
     */
    sendResetPasswordEmail(user, token) {
        return this._sendHtmlEmail(
            {
                to: [user.email],
                from,
                subject: `Forgotten password reset`
            },
            'forgot-password-reset',
            {
                user,
                token,
                domain: `${config.publicServerName}.${config.domainName}`
            }
        );
    }
    sendAccountUpdated (user) {
        return this._sendHtmlEmail(
            {
                to: [user.email],
                from,
                subject: `Your IT-Climb account information was updated`
            },
            'account-updated',
            {
                user,
                token,
                domain: `${config.publicServerName}.${config.domainName}`
            }
        );
    }

    /**
     * @param {Instance.<Bank|Client>}model
     * @param {String} token
     * @return {Promise.<*,Error>}
     */

    sendSignUpEmail(model,token) {
        let User = model.get('User');
        return this._sendHtmlEmail({
                to: [User.email],
                from,
                subject: `Congratulations on joining the IT-Climb movement!`
            },
            'signup',
            {
                model,
                User,
                token,
                domain: `${config.publicServerName}.${config.domainName}`
            }
        );
    }

    _sendHtmlEmail(options, templateName, templateVars) {
        return EmailService._getTemplateContent(templateName)
            .then(/**String*/templateString => {
                let opts = _.omit(options, ['text']);

                templateVars = Object.assign({}, templateVars, {filename: `${__dirname}/templates/${templateName}.ejs`});
                opts.html = ejs.render(templateString, templateVars);

                let transport = this._getTransport();
                logger.info(`Sending EMAIL message [${templateName}] with params: ${JSON.stringify(templateVars)}`);
                return transport.sendMailAsync(opts);
            })
            .catch((err) => {
                logger.error(`Can't send email because of ${err.message}`);
                throw boom.internal(`Can't send email because of ${err.message}`);
            });
    }

    _getTransport() {
        if (!this._transport) {
            // EmailService._transport = mailer.createTransport({
            //     transport: 'ses',
            //     accessKeyId: 'AKIAIVH2CIJSIBLGB6UA',
            //     secretAccessKey: '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',
            //     region: 'us-west-1'
            // });
            let transport = mailer.createTransport(smtpTransport({
                host: config.mail.server,
                secureConnection: true,
                port:config.mail.port,
                auth:{
                    user:config.mail.user,
                    pass:config.mail.password
                }
            }));
            Promise.promisifyAll(transport);
            this._transport = transport;

        }
        return this._transport;
    }

    /**
     * @param {String}templateName
     * @return {Promise.<String,Error>}
     * @private
     */
    static _getTemplateContent(templateName) {
        return fs.readFileAsync(`${__dirname}/templates/${templateName}.ejs`, {encoding: 'utf8'});
    }

}

module.exports = new EmailService();
'use strict';

let winston = require('winston'),
    fs = require('fs'),
    logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}


module.exports = new winston.Logger({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            level: 'debug',
            //label: path,
            timestamp: true
        }),
        new (winston.transports.File)({
            filename: `${logDir}/test.log`,
            timestamp: true,
            level: 'verbose',
            tailable: true,
            json: false,
            //label: path,
            colorize: false,
            createDirectory: true,
            maxsize: 50 * 1024 * 1024//maxsize - 50 mbytes,
        })
    ]
});

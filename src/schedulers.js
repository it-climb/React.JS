'use strict';
const
    schedule = require('node-schedule'),
    ContractService = require('./models/campaign/service');


let SchedulerJobs = {

/*
    checkLocationsForCreatingContracts: ()=> {
        schedule.scheduleJob('0 1 * * * *', ()=> {
            ContractService.checkLocationsForCreatingContracts();
        });
    }
*/

};

module.exports = SchedulerJobs;
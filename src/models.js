'use strict';

let finder = require('fs-finder'),
    _ = require('lodash'),
    Sequelize = require("sequelize"),
    appConfig = require('./config/config'),
    env = appConfig.environment,
    config = _.extend(
        require("../config/sequelize.json")[env],
        {
            host: process.env.TEST_DB_HOST || 'localhost',
            database: process.env.TEST_DB_NAME || 'reactdb',
            username: process.env.TEST_DB_USERNAME || 'postgres',
            password: process.env.TEST_DB_PASSWORD || '1',
            dialectOptions: {
                application_name: _.trim(process.env.TEST_DB_APP_NAME)
            },
            replication: {
                write: {
                    username: process.env.TEST_DB_USERNAME,
                    password: process.env.TEST_DB_PASSWORD,
                    host: process.env.TEST_DB_HOST
                },
                read: `${_.trim(process.env.TEST_DB_HOST_REPLICA)},${process.env.TEST_DB_HOST}`.split(',')
                    .filter(string => !_.isEmpty(string))
                    .map(host=> {
                        return {
                            host: host,
                            username: process.env.TEST_DB_USERNAME,
                            password: process.env.TEST_DB_PASSWORD
                        }
                    })
            }
        }
    ),
    sequelize = new Sequelize(config.database, config.username, config.password, config),
    models = {
        sequelize: sequelize,
        Sequelize: Sequelize
    };

function loadModelsData(modelStorage) {
    let associateRequired = [],
        scopeIncludingRequired = [],
        scopedIncludesGetter = _.property('options.scopedIncludes'),
        scopeExtractor = (model)=> _.merge({}, model.options.scopes, {defaultScope: model.options.defaultScope});

    finder.from(__dirname).findFiles("model.js").forEach((file)=> {
        let rawModel = sequelize.import(file);
        (Array.isArray(rawModel) ? rawModel.forEach(processModel) : processModel(rawModel));

        function processModel(model) {
            modelStorage[model.name] = model;
            if (_.has(model, 'associate')) {
                associateRequired.push(model.name);
            }
            if (!!scopedIncludesGetter(model)) {
                scopeIncludingRequired.push(model.name);
            }
        }
    });
    scopeIncludingRequired.forEach((modelName)=> {
        /**@type {Model}*/
        let model = modelStorage[modelName];
        let modelScopes = scopeExtractor(model);
        /**@type {Object.<string,{model:string,[as]:string}[]>}*/
        let scopedIncludes = scopedIncludesGetter(model);
        _.keys(scopedIncludes).forEach((scopeName)=> {
            let modelScope = _.extend({}, modelScopes[scopeName]);
            let scopedInclude = scopedIncludes[scopeName];
            modelScope.include = [];
            scopedInclude.forEach((include)=> {
                modelScope.include.push(processInclude(include, modelStorage));
            });
            model.addScope(scopeName, modelScope, {override: true});
        });
    });
    associateRequired.forEach((modelName)=>modelStorage[modelName].associate(modelStorage));
    return modelStorage;
}

function processInclude(include, modelStorage) {
    let target = {};
    target.model = modelStorage[include.model];
    _.has(include, 'as') && (target.as = include.as);
    _.has(include, 'include') && (target.include = []);
    _.has(include, 'where') && (target.where = include.where);
    _.has(include, 'order') && (target.order = include.order);
    _.has(include, 'limit') && (target.limit = include.limit);
    _.has(include, 'required') && (target.required = include.required);
    _.has(include, 'scope') && (target.model.scope = modelStorage[include.model].scope(include.scope));
    _.forEach(include.include, (val)=> {
        target.include.push(processInclude(val, modelStorage));
    });
    return target;
}
/**
 * @exports models
 * @description Grabs model schemas for each service, stores them all and then creates the model associations.  This is the
 * only way to properly create the associations between the models and what is advised by the Sequelize team.
 *
 * @example { Business: <Sequelize Model>, sequelize: <Sequelize Connection>, Sequelize: <Sequelize Class> }
 *
 * @returns {Object.<String,Model>} Promise, which then returns an Object of all models.  See example.
 */
module.exports = loadModelsData(models);
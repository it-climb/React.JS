import Reflux       from 'reflux';
import request      from 'superagent';
import urlUtils   from './url_utils';
import _            from 'lodash';
import defaults     from 'superagent-defaults';
import cookie       from 'react-cookie';

import AppStateActions from '../actions/app_state'

/**
 * @export RefluxActionsCrud
 * @desc This is a function to help setup Reflux Actions for CRUD operations.  Simply pass in which endpoints you want
 * the service to support.  i.e. `getOne`, `getAll`, `create`, `update` & `delete`.  Then all the hard work is done for
 * you.  Works in conjunction with `RefluxStoresCrud`.  Then you can pass in additional actions using the `extend`
 * param.
 *
 * @returns 'RefluxActions' function object.
 *
 * @param {Object} services - Endpoints that you want the service to support.  Available properties `getOne`, `getAll`,
 * `create`, `update` & `delete`.  Any characters that are prefaced with a semicolon will be sourced from the data
 * passed into the Action.  ex:  `{ getOne: '/users/:id' }` when called with `userActions.getOne({id: 123})` would call
 * `GET /users/123`.
 *
 * @param {string} [services.getOne] - URL to service.  ex: '/users/:id'.
 * @param {string} [services.getAll] - URL to service.  ex: '/users'.
 * @param {string} [services.create] - URL to service.  ex: '/users'.
 * @param {string} [services.update] - URL to service.  ex: '/users/:id'.
 * @param {string} [services.delete] - URL to service.  ex: '/users/:id'.
 *
 * @param {object} [reqOptions] - Group of optional tools.
 *
 * @param {array} [reqOptions.extend] - Additional actions you want supported. ex: 'clearCache'.  You'll also need to extend the
 * RefluxStoresCrud to support the additional action.
 *
 * @param {function} [reqOptions.dataPrefilter] - A function that receives and returns the requests data.  Allowing it to
 * manipulate it.
 *
 * @param {array} [reqOptions.use] - An array of super-agent plugin functions
 */

export default function (services, reqOptions) {

    let activeCalls = [];

    let actions = {
        cleanStore: {}
    };

    // Goes through the `services` provided and creates an action for each.  Sets each one up with `asyncResult` set to
    // true, which calls the onActionCompleted and onActionFailed store calls when async is complete.
    // i.e. userActions.getOne({id:123}) will call 'onGetOneCompleted' in the user store once completed.
    for (let key in services) {
        if (services.hasOwnProperty(key)) {
            actions[key] = {asyncResult: true};
        }
    }

    // If a `update` service is provided then we by default add a `createInStore` action that allows the `update` action
    // to update the store directly without calling the update service when the update's sync option is set to false.
    // i.e. userActions.create({}, {sync: false}
    if (typeof services.create !== 'undefined') {
        actions.createInStore = {};
    }

    // If a `update` service is provided then we by default add a `updateInStore` action that allows the `update` action
    // to update the store directly without calling the update service when the update's sync option is set to false.
    // i.e. userActions.update({}, {sync: false}
    if (typeof services.update !== 'undefined') {
        actions.updateInStore = {};
    }

    // Add additional actions from the `extend` array if provided.
    if (reqOptions != undefined && reqOptions.extend != undefined) reqOptions.extend.forEach(action => {
        actions[action] = {};
    });

    let CrudActions = Reflux.createActions(actions);


    // Prefilter
    // Checks for prefilter and applies if it exists
    let prefilter = function (data) {
        if (reqOptions != undefined && (typeof reqOptions.dataPrefilter !== 'undefined')) {
            return reqOptions.dataPrefilter(data);
        } else {
            return data;
        }
    };

    // Use
    request.Request.prototype.addOptionsUse = function (opts) {
        if (opts != undefined && opts.use != undefined && Array.isArray(opts.use)) {
            opts.use.forEach((use) => {
                this.use(use);
            })
        }
        return this;
    };

    /**
     * @function getOne
     * @desc Makes a GET call to the getOne service endpoint and on success calls the Reflux Store's onGetOneComplete or
     * onGetOneFailed functions.
     *
     * @param {object} data - This is the necessary data for making the call.  i.e. { id: 123 }
     * @param {object} [options] - These are additional options that can be passed in.
     * @param {function} [cb] - Callback function.  Still trying to decide if we should have this or not.  Leaning
     * towards not.
     */
    if (typeof services.getOne !== 'undefined') {
        CrudActions.getOne.listen(function (data, options, cb) {

            let dataWrapper = prefilter(_.clone(data) || {}),
                url = urlUtils.parseUrl(services.getOne, dataWrapper),
                endPoint = "Get One " + url;

            delete dataWrapper.id;

            if (_.indexOf(activeCalls, endPoint) < 0) {
                activeCalls.push(endPoint);

                let stamp = `${new Date().getTime()} - ${services.getOne} -  ${JSON.stringify(data)}`;
                AppStateActions.block(stamp);

                request
                    .get(url)
                    .addOptionsUse(reqOptions)
                    .query(dataWrapper)
                    .end((err, res) => {
                        _.pull(activeCalls, endPoint);

                        if (err) this.failed(err);
                        else this.completed(res.body);
                        cb && cb(err, res && res.body);
                        AppStateActions.unblock(stamp)
                    });
            }
        });
    }

    /**
     * @function getAll
     * @desc Makes a GET call to the getAll service endpoint and on success calls the Reflux Store's onGetAllComplete or
     * onGetAllFailed functions.
     *
     * @param {object} data - This is the necessary data for making the call.  i.e. { organization_id: 123 }
     * @param {object} [options] - These are additional options that can be passed in.
     * @param {function} [cb] - Callback function.  Still trying to decide if we should have this or not.  Leaning
     * towards not.
     */
    if (typeof services.getAll !== 'undefined') {
        CrudActions.getAll.listen(function (data, options, cb) {

            let stamp = `${new Date().getTime()} - ${services.getAll} -  ${JSON.stringify(data)}`,
                endPoint = `${services.getAll} -  ${JSON.stringify(data)}`;

            if (_.indexOf(activeCalls, endPoint) < 0) {
                activeCalls.push(endPoint);
                AppStateActions.block(stamp);

                let dataWrapper = prefilter(_.clone(data) || {}),
                    url = urlUtils.parseUrl(services.getAll, dataWrapper);

                request
                    .get(url)
                    .addOptionsUse(reqOptions)
                    .query(dataWrapper)
                    .end((err, res) => {
                        _.pull(activeCalls, endPoint);

                        if (err) this.failed(err);
                        else this.completed(_.get(res, 'body.rows') ? res.body.rows : res.body);
                        cb && cb(err, res && res.body);
                        AppStateActions.unblock(stamp);
                    });
            }
        });
    }

    //CUSTOM ACTIONS
    let customActions = _.filter(Object.keys(services), function (actionName) {
        return _.isObject(services[actionName])
    });
    _.forEach(customActions, customAction => {
        switch (services[customAction].method) {
            case 'get':
                // console.log("187 ");
                CrudActions[customAction].listen(function (data, options, cb) {

                    let url = urlUtils.parseUrl(services[customAction].url, data),
                        dataWrapper = prefilter(_.clone(data) || {}),
                        stamp = `${new Date().getTime()} - ${services[customAction].url} - ${JSON.stringify(data)}`;

                    AppStateActions.block(stamp);

                    request
                        .get(url)
                        .addOptionsUse(reqOptions)
                        .query(dataWrapper)
                        .end((err, res) => {
                            // console.log("end 187 ");
                            if (err) {
                                this.failed(err);
                            } else {
                                this.completed(_.get(res, 'body.rows') ? res.body.rows : res.body);
                            }
                            cb && cb(err, res && res.body);
                            AppStateActions.unblock(stamp);
                        });
                });
                break;
            case 'post':
                /**
                 * @function create
                 * @desc Makes a POST to the create service endpoint and on success calls the Reflux Store's onCreateComplete or
                 * onCreateFailed functions.
                 *
                 * @param {object} data - This is the data that is posted to the service.
                 * i.e. { firstName: 'Chris', lastName: 'Stegner', ... }
                 *
                 * @param {object} [options] - These are additional options that can be passed in.
                 * @param {function} [cb] - Callback function.  Still trying to decide if we should have this or not.  Leaning
                 * towards not.
                 */
                CrudActions[customAction].listen(function (data, options, cb) {

                    if (options != undefined && options.sync == false) {
                        CrudActions.createInStore(data, true);
                        return;
                    }

                    let stamp = `${new Date().getTime()} - ${JSON.stringify(data)}`;
                    AppStateActions.block(stamp);
                    let url = urlUtils.parseUrl(services[customAction].url, data);
                    data = prefilter(data);
                    request
                        .post(url)
                        .addOptionsUse(reqOptions)
                        .send(data)
                        .end((err, res) => {
                            if (err) this.failed(err);
                            else this.completed(res.body);
                            cb && cb(err, res && res.body);
                            AppStateActions.unblock(stamp);
                        });
                });
                break;
            case 'put':
                /**
                 * @function update
                 * @desc Makes a PUT call to the update service endpoint and on success calls the Reflux Store's onUpdateComplete or
                 * onUpdateFailed functions.
                 *
                 * @param {object} data - This is the data to send to the service.  i.e. { id: 123, firstName: 'Christopher' }
                 *
                 * @param {object} [options] - These are additional options that can be passed in.
                 * @param {boolean} [options.sync] - If set to false this will call the `updateInStore` function directly and not
                 * make the PUT call to the update service endpoint.  This will call the `onUpdateInStore` function in the store
                 * and mark the stores data as "dirty" meaning that it's not synced with the database.  On the next update that the
                 * that does sync the store will be marked clean again.
                 *
                 * This is great for times when we want to update the UI of the app but don't want to save the changes to the API yet.
                 *
                 * @param {function} [cb] - Callback function.  Still trying to decide if we should have this or not.  Leaning
                 * towards not.
                 */
                CrudActions[customAction].listen(function (data, options, cb) {
                    let isFormData = data instanceof FormData,
                        dataWrapper = (isFormData ? data : _.clone(data)) || {};//to protect original data in store from modifying
                    if (options != undefined && options.sync == false) {
                        CrudActions.updateInStore(dataWrapper, true);
                        return;
                    }
                    let stamp = `${new Date().getTime()} - ${JSON.stringify(data)}`;
                    AppStateActions.block(stamp);

                    let url = urlUtils.parseUrl(services[customAction].url, isFormData ? options : dataWrapper);
                    //remove snake-case fields from the request
                    if (!isFormData) {
                        Object.keys(dataWrapper).forEach(function (field) {
                            if (_.includes(field, '_')) {
                                delete dataWrapper[field];
                            }
                        })
                    }
                    delete dataWrapper.id;
                    delete dataWrapper.updatedAt;
                    delete dataWrapper.updated_at;

                    dataWrapper = prefilter(dataWrapper);

                    request
                        .put(url)
                        .addOptionsUse(reqOptions)
                        .send(dataWrapper)
                        .end((err, res) => {
                            if (err) this.failed(err);
                            else this.completed(res.body);
                            cb && cb(err, res && res.body);
                            AppStateActions.unblock(stamp);
                        });
                });
                break;
            case 'delete':
                /**
                 * @function delete
                 * @desc Makes a DELETE call to the getOne service endpoint and on success calls the Reflux Store's onDeleteComplete or
                 * onDeleteFailed functions.
                 *
                 * @param {object} data - This is the necessary data for making the call.  i.e. { id: 123 }
                 * @param {object} [options] - These are additional options that can be passed in.
                 * @param {function} [cb] - Callback function.  Still trying to decide if we should have this or not.  Leaning
                 * towards not.
                 */
                CrudActions[customAction].listen(function (data, options, cb) {
                    let stamp = `${new Date().getTime()} - ${JSON.stringify(data)}`;
                    AppStateActions.block(stamp);

                    let dataWrapper = prefilter(_.clone(data) || {}),
                        url = urlUtils.parseUrl(services[customAction].url, dataWrapper);

                    request
                        .del(url)
                        .addOptionsUse(reqOptions)
                        .end((err, res) => {
                            if (err) this.failed(err);
                            else this.completed(res.body);
                            cb && cb(err, res && res.body);
                            AppStateActions.unblock(stamp);
                        });
                });
                break;
            default:
                throw new Error('Unsupported custom action: ' + JSON.stringify(customAction));
        }
    });

    return CrudActions;
}
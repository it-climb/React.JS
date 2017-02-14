'use strict';
import Reflux   from 'reflux';
import _        from 'lodash';
import page     from 'page';

// ACTIONS
import appStateActions  from '../actions/app_state';

// APP STATE STORE
let urlHistory = [window.location.hash];

/**
 * @name defaults
 * @type {Object}
 * @desc This should list every possible app_state property.  If we add another app_state property anywhere in
 * our application then it should be added here as well.
 */
let defaults = {
    urlHistory: urlHistory,   // array - purposefully pointed to an array in memory, so that it keeps it's own state.
    blockedUI: []
};

let fieldsToStore = ['cart'];

/**
 * @name defaults
 * @type {Array}
 * @desc These are fields that aren't reset when the "reset" trigger is pass with an update.
 */
let persistentFields = [];

export default Reflux.createStore({
    listenables: [appStateActions],

    /**
     * @method onUpdate
     * @desc Updates the App's State.  Should only be accessed by the router as we don't want to change App State
     * directly.
     *
     * @param {Object} obj - Updated App State values.
     * @param {boolean} reset - Resets the App State to the default values before applying updates on top, when set to
     * true
     */
    onUpdate: function (obj, reset) {
        // this adds value of persistent fields to the defaults object
        if (reset) {
            persistentFields.forEach((field) => {
                defaults[field] = this.appState[field];
            });
        }

        // We need to clone the current appState so that updates to it can be compared with the current appState before
        // applying them.
        let newAppState = reset
            ? _.merge(_.clone(defaults), obj)
            : _.merge(_.clone(this.appState), obj);
        this._updateStore(newAppState);
        // Don't update unless there is a reason to.
        if (_.isEqual(this.appState, newAppState)) return;

        // Add state's URL path if it has appState.update changed it.
        if (newAppState.urlHistory[newAppState.urlHistory.length - 1] != window.location.hash)
            newAppState.urlHistory.push(window.location.hash);

        this.appState = newAppState;
        this.updateApp();
    },

    /**
     * @method onUpdate
     * @desc Goes to previous URL and sets up it's state.  Should be used anytime we want to send the user back.
     */
    onBack: function () {
        // Remove current page url since going back.
        this.appState.urlHistory.pop();

        // Set URL of page we are going back to, then remove it's url as well since the url will be added right back in
        // to the history.
        let hash = this.appState.urlHistory.pop();


        if (hash) page.show(hash);
    },

    onBlock: function (key) {
        this.appState.blockedUI.push(key);
        this.updateApp();
    },

    onUnblock: function (key) {
        _.remove(this.appState.blockedUI, ui => ui === key);
        this.updateApp();
    },

    /**
     * @method updateApp
     * @desc Triggers the rest of the app to update to the current App State.  Can't be accessed outside of Store.
     */
    updateApp: function () {
        // Causes rest of app to update
        this.trigger(this.appState);
    },

    /**
     * @method getInitialState
     * @desc Sets and returns initial App State.
     */
    getInitialState: function () {
        this.appState = defaults;
        this._loadFromStore(this.appState);
        return this.appState;
    },

    _updateStore: appState => {
        Object.keys(appState)
            .filter(fieldName => fieldsToStore.indexOf(fieldName) >= 0)
            .forEach(fieldName => localStorage.setItem(fieldName, JSON.stringify(appState[fieldName])));
    },
    _loadFromStore: appState => {
        fieldsToStore.forEach(field => appState[field] = JSON.parse(localStorage.getItem(field)));
    }
});
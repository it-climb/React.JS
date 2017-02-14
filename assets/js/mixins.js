'use strict';
import Reflux   from 'reflux';


// STORES
import appStateStore from './stores/app_state';
import sessionStore from './stores/session';
import userStore from './stores/user';

/**
 * These second param in the Reflux.connect functions below get passed into the main app's state.  For instance
 * `Reflux.connect(businessStore, "businesses")` creates `this.state.businesses` in app.js
 */
export default [
    Reflux.connect(appStateStore, "appState"),
    Reflux.connect(sessionStore, "sessions"),
    Reflux.connect(userStore, "users")
]
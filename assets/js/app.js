'use strict';
import _ from "lodash";
import React from "react";
import {render} from "react-dom";
import {browserHistory} from "react-router";
import cookie from "react-cookie";
import mixins from "./mixins";
import io from 'socket.io-client';
import SessionActions from "./actions/session";
import AppStateActions from "./actions/app_state";
import UserActions from "./actions/user";

export default React.createClass({
    mixins,
    
    getInitialState() {
        let accessToken = cookie.load("access_token");
        return {
            accessToken,
            userId: cookie.load("userId"),
            loaded: false,
            deviceType: '',
            loggedIn: !_.isEmpty(accessToken)
        }
    },

    componentWillMount() {
        if (!_.isUndefined(this.state.accessToken)) {
            return SessionActions.getOneAsync({}, {})
                .then(userId => {
                    return AppStateActions.update({userId: userId.userId})
                })
                .then(() => UserActions.getMeAsync({}, {}))
                .then(this._initWS.bind(this))
                .finally(() => setTimeout(this.setState.bind(this, {loaded: true}, void(0)), 0));
        }
        return this.setState({loaded: true});
    },

    _initWS() {
        let socket = io.connect({transports: ['websocket'], forceNew: true,query:`token=${this.state.accessToken}`});
        socket.on('connect-stats', stats => console.log(stats));
        AppStateActions.update({socket});
    },

    render() {

        let currentUser = this.state.users[this.state.appState.userId],
            {props, state} = this;

        return (
            <div className="app">
                {
                    state.loaded &&
                    <div>{React.cloneElement(props.children, {stores: state, currentUser})}</div>
                }
                
                {/*loader*/
                    (!_.isEmpty(state.appState.blockedUI) || !state.loaded) &&
                    <div className="loader">
                        <div></div>
                    </div>
                }
            </div>
        );
    }
});
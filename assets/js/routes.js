'use strict';
import React from "react";
import {render} from "react-dom";
import {browserHistory, Router, Route, IndexRoute} from "react-router";
import cookie from "react-cookie";
import App from "./app";
import Home from "./components/home/home";
import Login from "./components/auth/login/login";
import Register from "./components/auth/register/register";
import Logout from "./components/auth/logout/logout";
import Dashboard from "./components/dashboard/dashboard";
import AccountEdit from './components/dashboard/account_edit/account_edit';
import ForgotPassword from './components/auth/forgot_password/forgot_password';
import PageNotFound from './common_components/page_not_found/page_not_found';
import Mobile from './common_components/mobile/mobile';
import Rate from './components/bank/rate_page/rate_page';
import About from './common_components/about/about';
import FAQ from './common_components/faq/faq';
import ContactUs from './common_components/contacts/contacts';


function requireAuth(nextState, replace) {
    if (!cookie.load("access_token")) {
        replace({pathname: '/login', state: {nextPathname: nextState.location.pathname}});
    }
}

function redirectAuthenticatedUser(nextState, replace) {
    if (!!cookie.load("access_token")) {
        replace({pathname: '/dashboard', state: {nextPathname: nextState.location.pathname}});
    }
}

let hasAuthCookie = !!cookie.load("access_token");

export default (function (hasAuthCookie) {

    return (
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Home} onEnter={redirectAuthenticatedUser}/>
                <Route path='login' component={Login}/>
                <Route path='logout' component={Logout}/>
                <Route path='register' component={Register}/>
                <Route path='forgot-password' component={ForgotPassword}/>
                <Route path='dashboard' component={Dashboard}/>
                <Route path='dashboard/edit' component={AccountEdit}/>
                <Route path='mobile' component={Mobile}/>
                <Route path='rate' component={Rate}/>
                <Route path='about' component={About}/>
                <Route path='faq' component={FAQ}/>
                <Route path='contact-us' component={ContactUs}/>
            </Route>
            <Route path="*" component={PageNotFound}/>
        </Router>
    );
}(hasAuthCookie));
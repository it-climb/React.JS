'use strict';
import moment from 'moment';
import React from "react";
import request from "superagent";
import {Row, Col, FormGroup, FormControl, Checkbox, Button, Alert, HelpBlock, ControlLabel} from "react-bootstrap";
import MaskedInput from 'react-maskedinput';
import _ from "lodash";
import Promise from "bluebird";
import DateTime from 'react-datetime';

import EditProfile from './../../../../common_components/profile_edit/profile_edit';
import AddressEdit from './../../../../common_components/profile_edit/address_edit';

import ClientActions from './../../../../actions/client';
import AppStateActions from './../../../../actions/app_state';
import UserActions from './../../../../actions/user';

export default React.createClass({
    propTypes: {
        params: React.PropTypes.object.isRequired,
        //contains all the stores
        stores: React.PropTypes.object.isRequired,
        //current logged in user or null
        currentUser: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {
            loaded: false,
            serverError: null,
            client: null,
            errors: {},
            tx: [],
            userChanged: false,
            passwordChanged: false,
            billingChanged: false,
            clientChanged: false,
            billingAddressSame: false,
            processingError: null,
            txSort: {
                column: 'createdAt',
                direction: 'DESC'
            }
        };
    },
    componentDidMount(){
        let {currentUser} = this.props;
        if (!currentUser || !currentUser.Client) {
            return this.setState({loaded: true});
        }

        let client = Object.assign({}, currentUser.Client, {User: {email: currentUser.email, id: currentUser.id}});

        if (_.get(client, 'settings.dob', false)) {
            client.settings.dob = moment(client.settings.dob);
        }

        this.setState({
            client: client,
            loaded: true,
            userChanged: false,
            passwordChanged: false,
            billingChanged: false,
            clientChanged: false,
            billingAddressSame: false,
            errors: {}
        });
    },
    _loadBilling(){
        let {client} = this.state,
            {id}= client,
            $that = this;
        return ClientActions.getBillingAsync({id}, {})
            .then(billingData => {
                if (!billingData) {
                    return;
                }
                let cardInfo = _.get(billingData, 'customer.sources.data[0]', {});
                client.card = {
                    line1: cardInfo.address_line1,
                    line2: cardInfo.address_line2,
                    city: cardInfo.address_city,
                    postal_code: cardInfo.address_zip,
                    state: cardInfo.address_state,
                    number: cardInfo.last4,
                    exp_year: cardInfo.exp_year,
                    exp_month: cardInfo.exp_month
                };
                $that.setState({client});
            })
    },
    _onInputChange(ev){
        let {name, value} = ev.target;
        return this._onChange(name, value);
    },
    _onChange(field, value){
        let {client, userChanged, passwordChanged, clientChanged, billingChanged, errors} = this.state;
        (field === 'settings.dob') && value.toDate();

        passwordChanged = /^user\..+password$/i.test(field) || passwordChanged;
        userChanged = /^user/i.test(field) || userChanged;
        clientChanged = !userChanged || clientChanged;
        billingChanged = /^card\./i.test(field) || billingChanged;

        _.set(client, field, value);
        _.unset(errors, field);
        this.setState({client, errors, passwordChanged, userChanged, clientChanged, billingChanged});
        if (/^location\./.test(field)) {
            this._maybeSyncAddress();
        }
        if (passwordChanged) {
            this._maybeRefreshPasswordStatus();
        }
    },
    _toggleBillingAddress(){
        let {billingAddressSame}= this.state;
        this.setState({billingAddressSame: !billingAddressSame, billingChanged: true});
        this._maybeSyncAddress();
    },
    _maybeSyncAddress(){
        let {client, billingAddressSame} = this.state;
        if (!billingAddressSame) {
            return;
        }
        let {location, card} = client;
        Object.keys(client.location).forEach(field => {
            card[field] = location[field];
        });
        this.setState({client});

    },
    _maybeRefreshPasswordStatus(){
        let {client} = this.state,
            {User} = client;
        if (_.trim(User.oldPassword).length === 0 &&
            _.trim(User.newPassword).length === 0 &&
            _.trim(User.confirmPassword).length === 0) {
            this.setState({passwordChanged: false})
        }
    },
    _onFormSubmit(ev){
        ev.preventDefault();
        this._submit();
    },
    _submit(){
        if (!this._isValid()) {
            return;
        }

        let $that = this;
        this._maybeUpdateLogo()
            .then(newLogo => {
                let {client} = $that.state;
                if (!_.isEmpty(newLogo)) {
                    client.logoId = newLogo.id;
                    client.Logo = newLogo;
                }
                _.unset(client, 'logo');
                $that.setState({client});
                return this._maybeUpdateClient();
            })
            .then(updatedclient => {
                $that.setState({clientChanged: false});
                return $that._maybeUpdateBilling();
            })
            .then(() => {
                $that.setState({billingChanged: false});
                return $that._maybeUpdateUser();

            })
            .then(updatedUser => {
                $that.setState({userChanged: false, passwordChanged: false});
            })
            .catch(processingError => {
                $that.setState({processingError});
                console.log(processingError);
            })
            .finally(UserActions.getMeAsync.bind(UserActions, {join: ['Bank', 'Client']}, {}));
    },
    /**
     * @return {Promise}
     */
    _maybeUpdateClient(){
        let {client, clientChanged} = this.state,
            $that = this;

        if (!clientChanged) {
            return Promise.resolve(client);
        }
        return ClientActions.updateAsync(client, {})
            .then(client=>{
                if (_.get(client, 'settings.dob', false)) {
                    client.settings.dob = moment(client.settings.dob);
                }
                return client;
            })
            .catch(err => {
                let {errors}= $that.state;
                let errorMessages = _.get(err, 'response.body.details', {});
                Object.keys(errorMessages)
                    .forEach(field => _.set(errors, field, errorMessages[field]));
                $that.setState({errors});
                throw err;
            });
    },
    /**
     * @return {Promise}
     */
    _maybeUpdateUser(){
        let {client, userChanged, passwordChanged} =this.state,
            {User} = client,
            $that = this;
        if (!userChanged) {
            return Promise.resolve(User);
        }
        if (passwordChanged) {
            User.password = User.newPassword;
        }
        return UserActions.updateAsync(User, {})
            .then(updatedUser=>{
                client.User.newPassword = '';
                client.User.oldPassword = '';
                client.User.confirmPassword = '';
                $that.setState({client: client});
            })
            .catch(err => {
                let {errors}= $that.state;
                let errorMessages = _.get(err, 'response.body.details', {});
                Object.keys(errorMessages)
                    .forEach(field => _.set(errors, `User.${field}`, errorMessages[field]));
                $that.setState({errors});
                throw err;
            });
    },

    _maybeUpdateBilling(){
        let {client, billingChanged} = this.state,
            {card} = client,
            {location} = client,
            $that = this;
        if (!billingChanged) {
            return Promise.resolve({});
        }
        let cardData = {
            exp_year: card.exp_year,
            exp_month: card.exp_month,
            cvc: card.cvc,
            number: _.replace(card.number, /[\*\s]+/g, ''),
            name: `${client.firstName} ${client.lastName}`,
            address_line1: location.line1,
            address_line2: location.line2,
            address_city: location.city,
            address_state: location.state,
            address_country: 'US',
            address_zip: location.postal_code
        };
    },

    _maybeUpdateLogo(){
        let {client} = this.state;
        if (!client.logo) {
            return Promise.resolve({});
        }
        let blockKey = 'profile-image-upload';
        AppStateActions.block(blockKey);
        return new Promise((resolve, reject) => {
            request.post('/api/images')
                .attach('files', client.logo)
                .end((err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(result.body[0]);
                })
        })
            .catch(err => {
                console.log('Failed to upload logo', err);
                return false;
            })
            .finally(AppStateActions.unblock.bind(AppStateActions, blockKey));
    },

    _isValid(){
        let {errors, billingChanged, userChanged, clientChanged, passwordChanged, client} = this.state,
            {User} = client;

        if (passwordChanged) {
            if (_.trim(User.oldPassword).length === 0) {
                _.set(errors, 'User.oldPassword', 'Old password required');
            }
            if (_.trim(User.newPassword).length === 0) {
                _.set(errors, 'User.newPassword', 'New password required');
            }
            if (User.newPassword !== User.confirmPassword) {
                _.set(errors, 'User.confirmPassword', `Confirm password doesn't matches password`);
            }
        }
        if (userChanged) {
            if (_.trim(User.email).length === 0) {
                _.set(errors, 'User.email', 'Email cannot be empty');
            }
        }
        if (clientChanged) {
            if (_.trim(client.businessName).length === 0) {
                _.set(errors, 'businessName', 'Business Name cannot be empty');
            }
        }
        if (billingChanged) {
            let {card}= client;
            if (!/^[0-9]{4}$/.test(card.exp_year)) {
                _.set(errors, 'card.exp_year', 'Invalid year');
            }
            if (!/^[0-9]{1,2}/.test(card.exp_month)) {
                _.set(errors, 'card.exp_month', 'Invalid month');
            }
            if (!/^[0-9]{3,4}$/.test(card.cvc)) {
                _.set(errors, 'card.cvc', 'Invalid value')
            }
            if (!/^[0-9]{12,19}/.test(_.replace(card.number, /[\*\s]+/g, ''))) {
                _.set(errors, 'card.number', 'Invalid value');
            }
        }
        this.setState({errors});
        return this._isEmpty(errors);
    },
    _isEmpty(obj){
        let keys = Object.keys(obj);
        return keys.length === 0 || keys.reduce((store, key) => store && (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0), true);
    },

    render(){
        if (!this.state.loaded) {
            return <div></div>
        }
        let {currentUser} =this.props;
        if (!currentUser || !currentUser.Client) {
            return <Alert bsStyle="danger">Go Away! You're not a Client!</Alert>
        }
        if (!!this.state.serverError) {
            return <Alert bsStyle="danger">{this.state.serverError.response.body.message}</Alert>
        }
        let {client, errors, userChanged, clientChanged, billingChanged, passwordChanged, processingError, tx} = this.state,
            onChange = this._onChange.bind(this),
            data = {
                entry: client,
                errors,
                onChange
            };
        return <div className="test-dashboard-edit-client-page container">
            <form onSubmit={this._onFormSubmit.bind(this)} name="client-dash-form">
                <h1 className="first-headliner text-center">Account</h1>
                <EditProfile {...data}/>
                <div
                    className={`profile-form-submit ${clientChanged || userChanged || billingChanged || passwordChanged ? 'show-submit' : 'hide-submit'}`}>
                    {
                        processingError &&
                        <Alert bsStyle="danger" onDismiss={this.setState.bind(this, {processingError: null}, void(0))}>
                            Unable to save
                            profile: {_.get(processingError, 'response.body.message', processingError.message)}
                        </Alert>
                    }
                    <div>
                        <Button className="profile-form-submit-button btn btn-simple"
                                onClick={this.componentDidMount.bind(this)}>cancel</Button>
                        <Button className='profile-form-submit-button btn btn-main' disabled={!this._isEmpty(errors)}
                                onClick={this._submit.bind(this)}>update settings</Button>
                    </div>
                </div>
            </form>
        </div>;
    }
});
'use strict';
import React from "react";
import _ from "lodash";
import request from "superagent";
import Promise from "bluebird";
import moment from 'moment';
import {Row, Col, Button, FormGroup, FormControl, Checkbox, Alert, HelpBlock, Radio, ControlLabel} from "react-bootstrap";

import EditProfile from './../../../../common_components/profile_edit/profile_edit';

import BankActions from "./../../../../actions/bank";
import UserActions from "./../../../../actions/user";
import AppStateActions from './../../../../actions/app_state';

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
            bank: null,
            errors: {},
            tx: [],
            userChanged: false,
            passwordChanged: false,
            billingChanged: false,
            bankChanged: false,
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
        if (!currentUser || !currentUser.Bank) {
            return this.setState({loaded: true});
        }
        let {id} = currentUser.Bank,
            $that = this,
            bank = Object.assign({}, currentUser.Bank, {User: {email: currentUser.email, id: currentUser.id}});

        if (_.get(bank, 'settings.dob', false)) {
            bank.settings.dob = moment(bank.settings.dob);
        }

        $that.setState({
            bank: bank,
            loaded: true,
            userChanged: false,
            passwordChanged: false,
            billingChanged: false,
            bankChanged: false,
            billingAddressSame: false,
            errors: {},
        });
    },
    _loadBilling(){
        let {bank} = this.state,
            {id}= bank,
            $that = this;
        return BankActions.getBillingAsync({id}, {})
            .then(billingData => {
                if (!billingData) {
                    return;
                }
                let bankAccount = _.get(billingData, 'account', {}),
                    address = _.get(bankAccount, 'legal_entity.address', {}),
                    accountInfo = _.get(bankAccount, 'external_accounts.data[0]', {});

                bank.bank = {
                    line1: address.line1,
                    line2: address.line2,
                    city: address.city,
                    postal_code: address.postal_code,
                    state: address.state,
                    routing_number: accountInfo.routing_number,
                    account_number: accountInfo.last4,
                    account_holder_name: accountInfo.account_holder_name,
                    account_holder_type: accountInfo.account_holder_type
                };
                $that.setState({bank});
            })
    },

    _onInputChange(ev){
        let {name, value} = ev.target;
        return this._onChange(name, value);
    },
    _onChange(field, value){
        let {bank, userChanged, passwordChanged, bankChanged, billingChanged, errors} = this.state;
        (field === 'settings.dob') && value.toDate();
        passwordChanged = /^user\..+password$/i.test(field) || passwordChanged;
        userChanged = /^user/i.test(field) || userChanged;
        bankChanged = !userChanged || bankChanged;
        billingChanged = /^bank\./i.test(field) || billingChanged;

        _.set(bank, field, value);
        _.unset(errors, field);
        this.setState({bank, errors, passwordChanged, userChanged, bankChanged, billingChanged});
        if (passwordChanged) {
            this._maybeRefreshPasswordStatus();
        }
    },

    _maybeRefreshPasswordStatus(){
        let {bank} = this.state,
            {User} = bank;
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
                let {bank} = $that.state;
                if (!_.isEmpty(newLogo)) {
                    bank.logoId = newLogo.id;
                    bank.Logo = newLogo;
                }
                _.unset(bank, 'logo');
                $that.setState({bank});
                return $that._maybeUpdateBank();
            })
            .then(updatedbank => {
                $that.setState({bankChanged: false});
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
    _maybeUpdateBank(){
        let {bank, bankChanged} = this.state,
            $that = this;

        if (!bankChanged) {
            return Promise.resolve(bank);
        }
        return BankActions.updateAsync(bank, {})
            .then(bank => {
                if (_.get(bank, 'settings.dob', false)) {
                    bank.settings.dob = moment(bank.settings.dob);
                }
                return bank;
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
        let {bank, userChanged, passwordChanged} =this.state,
            {User} = bank,
            $that = this;
        if (!userChanged) {
            return Promise.resolve(User)

        }
        if (passwordChanged) {
            User.password = User.newPassword;
        }
        return UserActions.updateAsync(User, {})
            .then(updatedUser=>{
                bank.User.newPassword = '';
                bank.User.oldPassword = '';
                bank.User.confirmPassword = '';
                $that.setState({bank: bank});
            })
            .catch(err => {
                let {errors}= $that.state;
                let errorMessages = _.get(err, 'response.body.details', {});
                Object.keys(errorMessages)
                    .forEach(field => _.set(errors, `User.${field}`, errorMessages[field]));
                $that.setState({errors});
                throw err;
            })
    },
    _maybeUpdateBilling(){
        let {bank, billingChanged} = this.state,
            {card} = bank,
            {location} = bank,
            $that = this;
        if (!billingChanged) {
            return Promise.resolve({});
        }
        let accountData = {
            routing_number: bank.routing_number,
            account_number: _.replace(bank.account_number, /[\*\s]+/g, ''),
            account_holder_name: bank.account_holder_name,
            account_holder_type: bank.account_holder_type,
            address_line1: location.line1,
            address_line2: location.line2,
            address_city: location.city,
            address_state: location.state,
            address_zip: location.postal_code,
            country: 'US',
            currency: 'USD'
        };
    },
    _maybeUpdateLogo(){
        let {bank} = this.state;
        if (!bank.logo) {
            return Promise.resolve({});
        }
        let blockKey = 'profile-image-upload';
        AppStateActions.block(blockKey);
        return new Promise((resolve, reject) => {
            request.post('/api/images')
                .attach('files', bank.logo)
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
        let {errors, billingChanged, userChanged, bankChanged, passwordChanged, bank} = this.state,
            {User} = bank;

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
        if (bankChanged) {
            if (_.trim(bank.businessName).length === 0) {
                _.set(errors, 'name', 'Business Name cannot be empty');
            }
        }
        if (billingChanged) {
            let {bank}= bank;
            if (!/^[0-9\-]{5,}$/.test(bank.routing_number)) {
                _.set(errors, 'bank.routing_number', 'Invalid routing number');
            }
            if (!/^[0-9]{8,}/.test(_.replace(bank.account_number, /[\*\s]+/g, ''))) {
                _.set(errors, 'bank.account_number', 'Invalid account number');
            }
            if (_.trim(bank.account_holder_name).length === 0) {
                _.set(errors, 'bank.account_holder_name', 'Field cannot be empty')
            }
            /*if (commonUtils.bank.accountTypes.indexOf(bank.account_holder_type) === -1) {
                _.set(errors, 'bank.account_holder_type', 'Please, select account type');
            }*/
        }
        this.setState({errors});
        return _.isEmpty(errors);
    },
    _isEmpty(obj){
        let keys = Object.keys(obj);
        return keys.length === 0 || keys.reduce((store, key) => store && (typeof obj[key] === 'object' && Object.keys(obj[key]).length === 0), true);
    },

    render(){
        if (!this.state.loaded) {
            return <div></div>
        }
        let {currentUser} = this.props;
        if (!currentUser || !currentUser.Bank) {
            return <Alert bsStyle="danger">Go Away! You're not a bank!</Alert>
        }
        if (!!this.state.serverError) {
            return <Alert bsStyle="danger">{this.state.serverError.response.body.message}</Alert>
        }
        let {bank, errors, userChanged, bankChanged, billingChanged, passwordChanged, processingError} = this.state,
            onChange = this._onChange.bind(this),
            $that = this,
            data = {
                entry: bank,
                errors,
                onChange
            };
        console.log("myRender");
        return <div className="dashboard-edit-bank-page container">
            <form onSubmit={this._onFormSubmit.bind(this)} name="bank-dash-form">
                <h1 className="first-headliner center-text">Account</h1>
                <EditProfile {...data}/>
                <div
                    className={`profile-form-submit ${bankChanged || userChanged || billingChanged || passwordChanged ? 'show-submit' : 'hide-submit'}`}>
                    {
                        processingError &&
                        <Alert bsStyle='danger' onDismiss={this.setState.bind(this, {processingError: null}, void(0))}>
                            Unable to save profile:
                            {_.get(processingError, 'response.body.message', processingError.message)}
                        </Alert>
                    }
                    <div>
                        <Button className="profile-form-submit-button btn btn-simple"
                                onClick={this.componentDidMount.bind(this)}>cancel</Button>
                        <Button className='profile-form-submit-button btn btn-main' disabled={!this._isEmpty(errors)}
                                onClick={this._submit.bind(this)}>update
                            settings</Button>
                    </div>
                </div>
            </form>
        </div>
    }
});
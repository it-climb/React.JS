'use strict';
import React from "react";
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, Radio, ControlLabel, Checkbox, Navbar} from "react-bootstrap";
import {browserHistory} from "react-router";
import _ from "lodash";

import UserActions from "./../../../actions/user";
import SessionActions from "./../../../actions/session";

export default React.createClass({
    propTypes: {
        currentUser: React.PropTypes.object.isRequired
    },

    getInitialState(){
        return {
            serverError: null,
            errors: [],
            toggleCheckbox:true
        };
    },
    componentWillMount(){
        let {currentUser} = this.props;
        if (!!currentUser) {
            return browserHistory.push('/');
        }
    },
    _handleGoTo(goToPage) {
        return browserHistory.push.bind(browserHistory, goToPage);
    },
    _inputChange(event){
        let {name, value} = event.target,
            {errors} =this.state,
            serverError = null;
        if (errors.indexOf(name) !== -1) {
            let errIdx = errors.indexOf(name);
            errors.splice(errIdx, 1);
        }
        this.setState({[name]: value, errors, serverError});
    },
    _submitRegistration(event){
        event.preventDefault();
        if(this.state.toggleCheckbox){
            let errors = this._validate();
            if (errors.length !== 0) {
                this.setState({errors});
                return;
            }

            let {email, password, businessName, type} = this.state;
            UserActions.createAsync({email, password, businessName, type}, {})
                .then(()=>SessionActions.createAsync({email, password}, {}))
                .then(()=>window.location.replace(`/dashboard`))
                .catch(serverError=> {
                    console.log(serverError);
                    this.setState({serverError});
                })

        }
    },
    _validate(){
        let fields = ['email', 'password', 'businessName', 'type'];
        return fields.reduce((/**String[]*/errors, /**String*/fieldName)=> {
            if (_.trim(this.state[fieldName]).length === 0) {
                errors.push(fieldName);
            }
            return errors;
        }, []);


    },

    render(){
        return (<div className="test-login">
                <header className="login-header">
                    <Navbar fluid={true}>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <a href="/" className="brand_logo" title="logo">
                                    IT-Climb
                                </a>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                    </Navbar>
                </header>
                <div className="container">
                    <Row>
                        <Col md={4} mdOffset={4}>
                            <h3 className="form-header">Get Started Absolutely FREE</h3>

                            <FormGroup controlId="type" className="radio" {...(this.state.errors.indexOf('type') !== -1 ? {validationState: 'error'} : {})}>
                                <Radio inline name="type"
                                       value={'Client'} {...(this.state.type === 'Client' ? {checked: 'checked'} : {})}
                                       onChange={this._inputChange.bind(this)}><span>Client</span></Radio>
                                <Radio inline name="type"
                                       value={'Bank'} {...(this.state.type === 'Bank' ? {checked: 'checked'} : {})}
                                       onChange={this._inputChange.bind(this)}><span>Bank</span></Radio>
                            </FormGroup>
                            <FormControl.Feedback/>
                            <Form onSubmit={this._submitRegistration.bind(this)}>

                                {
                                    this.state.serverError &&

                                    (_.size(_.get(this.state.serverError, 'response.body.details', {})) > 0)
                                        ? _.map(this.state.serverError.response.body.details, error=> {
                                        return <Alert bsStyle="danger">{error}</Alert>
                                    })
                                        : !_.isEmpty(this.state.serverError) && <Alert
                                        bsStyle="danger">{_.get(this.state.serverError, 'response.body.message')}</Alert>
                                }

                                <FormGroup
                                    controlId="businessName" {...(this.state.errors.indexOf('businessName') !== -1 ? {validationState: 'error'} : {})}>
                                    <FormControl type="text" value={this.state.businessName} name="businessName"
                                                 onChange={this._inputChange.bind(this)} placeholder="Business Name"/>
                                    <FormControl.Feedback/>
                                </FormGroup>
                                <FormGroup
                                    controlId="email" {...(this.state.errors.indexOf('email') !== -1 ? {validationState: 'error'} : {})}>
                                    <FormControl type="text" value={this.state.email} name="email" className="text-lowercase"
                                                 onChange={this._inputChange.bind(this)} placeholder="Your Email"/>
                                    <FormControl.Feedback/>
                                </FormGroup>


                                <FormGroup
                                    controlId="password"  {...(this.state.errors.indexOf('password') !== -1 ? {validationState: 'error'} : {})}>
                                    <FormControl type="password" value={this.state.password} name="password"
                                                 onChange={this._inputChange.bind(this)} placeholder="Password"/>
                                    <FormControl.Feedback/>
                                </FormGroup>

                                <Checkbox className="test-checkbox text-center"
                                          checked={this.state.toggleCheckbox}
                                          onChange={()=>this.setState({toggleCheckbox: !this.state.toggleCheckbox})}>
                                    <span>I agree to go IT-Climb&nbsp;<a
                                        href="/assets/images/terms-of-service.pdf" download target="_blank">Agreement</a></span></Checkbox>

                                <input type="submit" value="sign up free"
                                       className="login-submit-button btn btn-main btn-big"/>

                                <p className="text-inform">Already have an account?&nbsp;
                                    <a href="#" onClick={this._handleGoTo('/login')}
                                       className="btn btn-link btn-start">Login!</a>
                                </p>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }


});
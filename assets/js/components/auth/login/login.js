'use strict';
import React from "react";
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar} from "react-bootstrap";
import {browserHistory} from "react-router";
import _ from "lodash";

import SessionActions from "./../../../actions/session";
import UserActions from "./../../../actions/user";

export default React.createClass({
    propTypes: {
        currentUser: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {email: '', password: '', errors: []}
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
    _submitLogin(event){
        event.preventDefault();
        let errors = [],
            {email, password} = this.state,
            $this = this;
        if (_.trim(email).length === 0) {
            errors.push('email');
        }
        if (_.trim(password).length === 0) {
            errors.push('password');
        }
        if (errors.length !== 0) {
            this.setState({errors});
            return;
        }

        SessionActions.createAsync({email, password}, {})
            .then(()=> {
                let {redirect} = $this.props.stores.appState;
                if (!_.isEmpty(redirect)) {
                    window.location.replace(redirect);
                } else {
                    window.location.replace('/dashboard');
                }
            })
            .catch(serverError=> {
                console.log(serverError);
                this.setState({serverError});
            });
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

    render(){
        return <div className="test-login">
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
                        <h3 className="form-header">Log Into Your IT-Climb Account</h3>

                        <Form onSubmit={this._submitLogin.bind(this)}>

                            {
                                this.state.serverError &&

                                <Alert bsStyle="danger">{_.get(this.state.serverError, 'response.body.message')}</Alert>

                            }

                            <FormGroup
                                controlId="email" {...(this.state.errors.indexOf('email') !== -1 ? {validationState: 'error'} : {})}>
                                <ControlLabel>Your Email</ControlLabel>
                                <FormControl type="text" value={this.state.email} name="email" className="text-lowercase"
                                             onChange={this._inputChange.bind(this)}/>
                                <FormControl.Feedback/>
                            </FormGroup>

                            <FormGroup
                                controlId="password"  {...(this.state.errors.indexOf('password') !== -1 ? {validationState: 'error'} : {})}>
                                <ControlLabel>Password</ControlLabel>
                                <FormControl type="password" value={this.state.password} name="password"
                                             onChange={this._inputChange.bind(this)} />
                                <FormControl.Feedback/>
                            </FormGroup>


                            <input type="submit" value="Login" className="login-submit-button btn btn-main btn-big"/>

                            <a href="#" onClick={this._handleGoTo('/forgot-password')}
                               className="btn btn-link btn-forgot">
                                Forgot Password?
                            </a>
                            <p className="text-inform">Don't have an account?&nbsp;
                                <a href="#" onClick={this._handleGoTo('/register')}
                                   className="btn btn-link btn-start">Get Started!</a>
                            </p>

                        </Form>
                    </Col>
                </Row>
            </div>

        </div>
    }
});
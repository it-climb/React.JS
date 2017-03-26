'use strict';
import React from "react";
import {Row, Col, Form, FormGroup, FormControl, Alert, ControlLabel, Navbar} from "react-bootstrap";
import {browserHistory} from "react-router";
import _ from "lodash";
import UserActions from "./../../../actions/user";

export default React.createClass({
    propTypes: {
        currentUser: React.PropTypes.object.isRequired
    },

    getInitialState() {
        return {
            serverError: null,
            errors: [],
            _resetPassword: false
        };
    },
    componentWillMount() {
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
    _sendResetPasswordEmail(event) {

        event.preventDefault();
        let that = this,
            errors = this._validate();
        if (errors.length !== 0) {
            this.setState({errors});
            return;
        }

        let {email} = this.state;
        UserActions.generateForgotPasswordTokenAsync({email}, {})
            .then(()=> {
                that.setState({linkHasBeenSent: true})
            })
            .catch(serverError=> {
                console.log(serverError);
                this.setState({serverError});
            })

    },
    _validate() {
        let fields = ['email'];
        return fields.reduce((/**String[]*/errors, /**String*/fieldName)=> {
            if (_.trim(this.state[fieldName]).length === 0) {
                errors.push(fieldName);
            }
            return errors;
        }, []);
    },

    render() {
        return (
            <div className="test-forgot-password">
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
                            <h3 className="form-header">Reset your password</h3>
                            {
                                !this.state.linkHasBeenSent &&
                                <Form onSubmit={this._sendResetPasswordEmail.bind(this)} >

                                    {
                                        this.state.serverError &&

                                        (_.size(_.get(this.state.serverError, 'response.body.details', {})) > 0)
                                            ? _.map(this.state.serverError.response.body.details, error=> {
                                            return <Alert bsStyle="danger">{error}</Alert>
                                        })
                                            : !_.isEmpty(this.state.serverError) && <Alert
                                            bsStyle="danger">{_.get(this.state.serverError, 'response.body.message')}</Alert>
                                    }

                                    <p className="form-description">
                                        Enter your email address and we will send you a link to reset your password.
                                    </p>

                                    <FormGroup
                                        controlId="email" {...(this.state.errors.indexOf('email') !== -1 ? {validationState: 'error'} : {})}>
                                        <ControlLabel>Your Email</ControlLabel>
                                        <FormControl type="text" value={this.state.email} name="email" className="text-lowercase"
                                                     onChange={this._inputChange.bind(this)}/>
                                        <FormControl.Feedback/>
                                    </FormGroup>

                                    <input type="submit" value="Send password reset email"
                                           className="submit-button btn btn-main btn-big"/>
                                </Form>
                            }
                            {
                                this.state.linkHasBeenSent &&
                                <p className="form-description">
                                    Link to reset the password has been sent to your email.
                                </p>
                            }

                            <p className="text-inform">Don't have an account?&nbsp;
                                <a href="#" onClick={this._handleGoTo('/register')}
                                   className="btn btn-link btn-start">Get Started!</a>
                            </p>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }


});
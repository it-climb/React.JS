'use strict';
import React from "react";
import {Row, Col, Form, FormGroup, FormControl, Alert} from "react-bootstrap";
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
            passHasBeenReset: false
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
    _resetPassword(event) {

        event.preventDefault();
        let that = this,
            errors = this._validate();
        if (errors.length !== 0) {
            this.setState({errors});
            return;
        }

        let {password} = this.state,
            {token} = this.props.params;
        UserActions.resetPasswordAsync({password, token}, {})
            .then(()=> {
                that.setState({passHasBeenReset: true})
            })
            .catch(serverError=> {
                console.log(serverError);
                this.setState({serverError});
            })

    },
    _validate() {
        let fields = ['password'];
        return fields.reduce((/**String[]*/errors, /**String*/fieldName)=> {
            if (_.trim(this.state[fieldName]).length === 0) {
                errors.push(fieldName);
            }
            return errors;
        }, []);
    },

    render() {
        return (
            <div className="test-reset-password">
                <div className="container">
                    <Row>
                        <Col md={4} mdOffset={4}>
                            <h3 className="form-header">Create new password</h3>
                            {
                                !this.state.passHasBeenReset &&
                                <Form onSubmit={this._resetPassword.bind(this)}>

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
                                        Reset password
                                    </p>

                                    <FormGroup
                                        controlId="password" {...(this.state.errors.indexOf('password') !== -1 ? {validationState: 'error'} : {})}>
                                        <FormControl type="text" value={this.state.password} name="password"
                                                     onChange={this._inputChange.bind(this)}
                                                     placeholder="Your new password"/>
                                        <FormControl.Feedback/>
                                    </FormGroup>

                                    <input type="submit" value="Submit"
                                           className="submit-button btn btn-main btn-big"/>
                                </Form>
                            }
                            {
                                this.state.passHasBeenReset &&
                                <div>
                                    <p className="form-description">
                                        New password has been created.
                                    </p>
                                    <p className="form-description">
                                        Now you can use it to&nbsp;
                                        <a href="#" onClick={this._handleGoTo('/login')}
                                           className="btn btn-link btn-start">login</a>
                                    </p>
                                </div>
                            }
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }


});
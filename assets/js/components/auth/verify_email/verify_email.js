'use strict';

import React from 'react';
import _ from 'lodash';
import {Row, Col, Alert} from 'react-bootstrap';

import UserActions from './../../../actions/user';

export default React.createClass({
    propTypes: {
        currentUser: React.PropTypes.object.isRequired
    },
    getInitialState(){
        return {loaded: false, error: null};
    },
    componentDidMount(){
        let {token} = this.props.params,
            that = this;
        UserActions.verifyEmailAsync({token}, {})
            .catch(error => that.setState({error}))
            .finally(this.setState.bind(this, {loaded: true}));
    },
    _getLoading(){
        return <div>Processing...</div>
    },
    _getError(error){
        return <Alert bsStyle="danger">{_.get(error, 'response.body.message', error.message)}</Alert>
    },
    _getSuccess(currentUser){
        return <Alert bsStyle="success">
            <p>Email was successfully verified!</p>
            <p>
                {
                    !!currentUser
                        ? <a href="/dashboard">Go to dashboard</a>
                        : <a href="/login">Go to login page</a>
                }
            </p>
        </Alert>
    },
    render(){
        let {loaded, error} = this.state,
            {currentUser} = this.props;
        return <div className="test-email-verification">
            <div className="container container-fluid">
                <Row>
                    <Col md={4} mdOffset={4}>
                        {
                            !loaded &&
                            this._getLoading()
                        }
                        {
                            loaded && error &&
                            this._getError(error)
                        }
                        {
                            loaded && !error &&
                            this._getSuccess(currentUser)
                        }
                    </Col>
                </Row>
            </div>
        </div>
    }
});
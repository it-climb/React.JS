'use strict';
import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar, Table} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  BankAction from '../../../actions/bank';
import  ClientRequestLine from '../../../components/dashboard/client/ClientRequestLine';
import  ClientCreditRequests from '../../../components/dashboard/client/ClientCreditRequests';


class ClientDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: this.props.currentUser.Client.id,
            newRender: 0
        }
        this.hadleUpdateClientDashboard = this.hadleUpdateClientDashboard.bind(this);

    }
    hadleUpdateClientDashboard(){
        console.log("237 hadleUpdateClientDashboard");
        this.setState({
            newRender: this.state.newRender + 1
        });
    }

    render(){
        console.log("242 hadleUpdateClientDashboard render");
        return(
            <div className = "test-dash-client">
                <ClientRequestLine currentUserId = {this.state.userId} updateClientDashboard = {this.hadleUpdateClientDashboard}/>
                <ClientCreditRequests currentUserId = {this.state.userId} newRender={this.state.newRender}/>
            </div>
        );
    }
}

// ClientDashboard.defaultProps = {
//
// };


ClientDashboard.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default ClientDashboard;

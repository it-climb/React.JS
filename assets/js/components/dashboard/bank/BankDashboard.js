'use strict';

import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar, Table} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  ClientAction from '../../../actions/client';

class BankAnswers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bankId: this.props.currentBankId,
            bankAnswers: [],
            clients: [],
            rend: false
        };
        this.handleCompleteAnswerStates = this.handleCompleteAnswerStates.bind(this);
    }

    componentWillMount(){
        let that = this;
        ClientAction.getAllClientsAsync({}, {})
            .then(clients => {
                if(clients.length > 0) {
                    that.setState({
                        clients: clients
                    });
                    console.log('29 clients:', clients);
                    that.handleCompleteAnswerStates();
                }
            })
            .catch(err=>{
                console.log('error ClientAction.getAllAsync 34 banksNames', err);
            });
        CreditAction.getByBankIdAsync({'id': that.state.bankId}, {})
            .then(bankAnswers => {
                if(bankAnswers.length > 0){
                    that.setState({
                        bankAnswers: bankAnswers
                    });

                }
                console.log("44 bankAnswers:", bankAnswers);
                that.handleCompleteAnswerStates();
            })
            .catch(err => {
                console.log('CreditAction.getByBankIdAsync componentWillMount 169 err', err);
            });
    }
    handleCompleteAnswerStates(){
        let that = this;
        if(this.state.bankAnswers.length > 0 && this.state.clients.length > 0 ){
            let bankAnswers = this.state.bankAnswers;
            let clients = this.state.clients;
            let num = 0;
            bankAnswers.map((ba)=>{
                let client = clients.filter((cl)=>{
                    return cl.id === ba.clientId;
                });
                bankAnswers[num].clientName = client[0].firstName + ' ' + client[0].lastName + ' ' + client[0].businessName;
                bankAnswers[num].clientPhone = client[0].phone + ', ' + client[0].mobilePhone;
                num++;
            });
            that.setState({
                bankAnswers: bankAnswers,
                rend: true
            });
            console.log("handleCompleteAnswersStates", that.state.bankAnswers);
        }
    }

    render(){
        let bankAnswers = [];
        if(this.state.rend){
            bankAnswers = this.state.bankAnswers;
        }
        console.log("78 bankAnswers", bankAnswers);
        return (
            <div className="test-dash-client">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Request Date</th>
                        <th>Client Name</th>
                        <th>Client Phone</th>
                        <th>Sum</th>
                        <th>Confirm</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        bankAnswers.map((el)=>{
                            let confirm = (el.confirm == null) ? 'In process' : el.confirm;
                            return(
                                <tr>
                                    <td>{el.requestDate}</td>
                                    <td>{el.clientName}</td>
                                    <td>{el.clientPhone}</td>
                                    <td>{el.sum}</td>
                                    <td>{confirm}</td>
                                </tr>);
                        })
                    }
                    </tbody>
                </Table>
            </div>
        );
    }

}

class BankDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            bankId: this.props.currentUser.Bank.id
        }
    }

    render() {
        console.log("this.props.currentUser:",this.props.currentUser);
        return (
            <div className="dash">
                <BankAnswers currentBankId = {this.state.bankId}/>
            </div>
        );
    }
}

BankDashboard.propTypes = {
    params: React.PropTypes.object.isRequired,
    stores: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.object.isRequired
};

export default BankDashboard;
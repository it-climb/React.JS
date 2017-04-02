'use strict';

import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar, Table, Radio, Checkbox} from "react-bootstrap";
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
                            {/*let confirm = (el.confirm == null) ? 'In process' : el.confirm;*/}
                            return(
                                <tr>
                                    <td>{el.requestDate}</td>
                                    <td>{el.clientName}</td>
                                    <td>{el.clientPhone}</td>
                                    <td>{el.sum}</td>
                                    <td key={el.id}>
                                        <BankSetAnswer confirm = {el.confirm} idAnswer = {el.id}/>
                                    </td>
                                </tr>);
                        })
                    }
                    </tbody>
                </Table>
            </div>
        );
    }

}

class BankSetAnswer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirm: this.props.confirm,
            idAnswer: this.props.idAnswer
        }
        this.handleSubmitAnswer = this.handleSubmitAnswer.bind(this);
        this.handleSetAnswer = this.handleSetAnswer.bind(this);
    }
    handleSubmitAnswer(ev){
        ev.preventDefault();
        let that = this;
        console.log('handleSubmitAnswer id',that.state.idAnswer, ' confirm', that.state.confirm);
        CreditAction.updateConfirmByIdAsync({'id':that.state.idAnswer, 'confirm':that.state.confirm}, {})
            .then(credits => {
                if(credits.length > 0) {
                    that.setState({
                    });
                }
            })
            .catch(err=>{
                console.log('error BankSubmitAnswer', err);
            });
    }
    handleSetAnswer(ev){
        let that = this;
        console.log('142 handleSetAnswer id',that.state.idAnswer,' confirm',that.state.confirm ,' val',ev.target.value);
        this.setState({
            confirm: ev.target.value
        });
        console.log('146 confirm',that.state.confirm, ' typeof confirm', typeof(that.state.confirm));

    }

    render() {
        let that = this;
        console.log("152 BankSetAnswer render confirm:",that.state.confirm,' idAnswer:', that.state.idAnswer);
        return (
            <div className="first-name">
                <Form key={'radioForm'+that.state.idAnswer} onSubmit={that.handleSubmitAnswer}>
                    <Radio onChange ={that.handleSetAnswer} checked = {that.state.confirm == 'no'}  name = {'radioBtn'+that.state.idAnswer} inline value="no" >No</Radio>
                    <Radio onChange ={that.handleSetAnswer}  checked = {that.state.confirm == 'yes'}  name = {'radioBtn'+that.state.idAnswer} inline value="yes" >Yes</Radio>
                    <Button type="submit" bsSize="small">Submit</Button>
                </Form>
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
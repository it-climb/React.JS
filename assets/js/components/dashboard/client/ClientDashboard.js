'use strict';
import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  BankAction from '../../../actions/bank';


class ClientDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // bankId: props.bankId,
            // bankBusinessName: props.bankBusinessName,
            // clientId: props.clientId,
            // sumOfCredit: props.sumOfCredit,
            // banksNames: props.banksNames
        };
        // console.log('banksNames',this.state.banksNames);
        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleChangeSum = this.handleChangeSum.bind(this);

    }
    componentDidMount(){

        let that = this;
        console.log("componentDidMount");
        BankAction.getAllBusinessNamesAsync({}, {})
            .then(res=> {
                console.log('getAllBusinessNamesAsync res', res);
                let banksNames = res;
                that.setState({
                    bankId: 'a17cc795-9fd7-46cf-b40b-66f51408f671',
                    bankBusinessName: 'bank1',
                    clientId: '2376a4a2-c6ec-44e0-ab24-4129df323c98',
                    sumOfCredit: 0,
                    banksNames: banksNames
                });
            })
            .catch(err=>{
                console.log('err', err);
            });

    }
    handleChangeBank(ev) {
        let self = this;
        this.setState({bankBusinessName: ev.target.value});
        console.log("257", self.state.bankBusinessName);
    }
    handleChangeSum(ev) {
        let self = this;
        this.setState({sumOfCredit: ev.target.value});
        console.log("263", self.state.sumOfCredit);
    }
    render(){
        console.log("57");
        let that = this;
        let banksNames = _.get(that.state, 'banksNames', []);
        return(
            <div className = "test-dash-client"  >
                {/*<Form onSubmit={this._submitCreateCredit.bind(this)}>*/}
                <Row>
                    <Col md={4} xs={4} lg={4} sm={4} className="first-name">
                            <ControlLabel>Bank</ControlLabel>
                            <select onChange={this.handleChangeBank}>
                                {
                                    banksNames.map(function(bankName){
                                        return (
                                            <option
                                                key={bankName.business_name}
                                                value={bankName.business_name}>
                                                bankName.business_name
                                            </option>
                                        );
                                    })
                                }
                                {/*<option key={1} value='1'>bank1</option>*/}
                                {/*<option key={2} value='2'>bank2</option>*/}
                            </select>
                    </Col>
                    <Col md={4} xs={4} lg={4} sm={4} className="second-name">
                            <ControlLabel>Sum</ControlLabel>
                            <input
                                type="text"
                                value={that.state.sumOfCredit}
                                placeholder="Input Sum Here"
                                onChange={this.handleChangeSum}>
                            </input>
                    </Col>
                    {/*<Col md={4} xs={4} lg={4} sm={4} className="second-name">*/}
                        {/*<FormGroup*/}
                            {/*/!*controlId="sum"  {...(this.state.errors.indexOf('sum') !== -1 ? {validationState: 'error'} : {})}>*!/*/}
                            {/*<ControlLabel>Sum</ControlLabel>*/}
                            {/*<FormControl type="sum" value={this.state.sum} name="sum"*/}
                                      {/*/!*onChange={this._inputChange.bind(this)} *!/*/}
                            {/*/>*/}
                            {/*<FormControl.Feedback/>*/}
                        {/*</FormGroup>*/}
                    {/*</Col>*/}

                    <Col md={4} xs={4} lg={4} sm={4} >
                         <input type="submit" value="CreateCredit" className="login-submit-button btn btn-main btn-big"/>
                    </Col>

                </Row>
                {/*</Form>*/}
            </div>
        );
    }
}
ClientDashboard.defaultProps = {

};


ClientDashboard.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default ClientDashboard;

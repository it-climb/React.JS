'use strict';
import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, ControlLabel} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  BankAction from '../../../actions/bank';

class ClientRequestLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clientId: this.props.currentUserId,
            bankId: '',
            bankBusinessName: '',
            sumOfCredit: '',
            banksNames: []
        };
        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleChangeSum = this.handleChangeSum.bind(this);
        this.handleCreateCredit = this.handleCreateCredit.bind(this);
    }

    componentWillMount(){
        let that = this;
        BankAction.getAllBusinessNamesAsync({}, {})
            .then(res => {
                let banksNames = res;
                if(banksNames && banksNames.length > 0) {
                    that.setState({
                        bankId: banksNames[0].id,
                        bankBusinessName: banksNames[0].business_name,
                        banksNames: banksNames
                    });
                }else{
                    console.log("error componentWillMount 46 banksNames = null");
                }
            })
            .catch(err=>{
                console.log('45 err', err);
            });
    }

    handleChangeBank(ev) {
        let num = ev.target.value;
        let bankObj = this.state.banksNames[num];
        this.setState({
            bankBusinessName: bankObj.business_name,
            bankId: bankObj.id
        });
    }
    handleChangeSum(ev) {
        this.setState({sumOfCredit: ev.target.value});
    }
    handleCreateCredit(){
        let that = this;
        CreditAction.createAsync({'bankId':that.state.bankId, 'clientId':that.state.clientId, 'sum':that.state.sumOfCredit}, {})
            .then(()=>{
                that.props.updateClientDashboard();
                that.setState({
                    sumOfCredit: ''
                })
            })
            .catch(err=>{
                console.log('64 CreditAction create err', err);
            });
    }

    render(){
        let that = this;
        // console.log("106 render this.state.bankId:", this.state.bankId," this.state.bankBusinessName:",this.state.bankBusinessName);
        let num = -1;
        let banksNames = _.get(that.state, 'banksNames', []);
        return(
            <div className = "test-dash-client"  >
                <Row>
                    <Col md={6} xs={6} lg={6} sm={6}>
                        <FormGroup controlId="formControlSelect">
                            <ControlLabel>Bank</ControlLabel>
                            <FormControl componentClass="select" placeholder="Select bank"
                                         onChange={this.handleChangeBank}>
                                {
                                    banksNames.map(function(bankName){
                                        num++;
                                        return (
                                            <option
                                                key={num}
                                                value={num}>
                                                {bankName.business_name}
                                            </option>
                                        );

                                    })
                                }
                            </FormControl>
                        </FormGroup>
                    </Col>
                    <Col md={4} xs={4} lg={4} sm={4} className="second-name">
                        <FormGroup controlId="sum">
                            <ControlLabel>Sum</ControlLabel>
                            <FormControl
                                value={that.state.sumOfCredit}
                                placeholder="Input Sum Here"
                                onChange={this.handleChangeSum}>
                            </FormControl>
                        </FormGroup>
                    </Col>
                    <Col md={2} xs={2} lg={2} sm={2} >
                        <ControlLabel>Submit Request</ControlLabel>
                        <Button
                            type="submit"
                            bsStyle='primary'
                            bsSize="large"
                            onClick = {this.handleCreateCredit}>
                            REQUEST
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

// ClientRequestLine.defaultProps = {
//
// };


ClientRequestLine.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default ClientRequestLine;

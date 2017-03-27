'use strict';
import React from 'react';
import {Row, Col, Form, FormGroup, FormControl, Button, Alert, ControlLabel, Navbar} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  BankAction from '../../../actions/bank';
// import RoleUtils from '../../../utils/role_utils';


class ClientDashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            clientId: this.props.currentUser.Client.id,
            bankId: '',
            bankBusinessName: '',
            sumOfCredit: 0,
            banksNames: []
            // bankId: 'a17cc795-9fd7-46cf-b40b-66f51408f671',
            // bankBusinessName: 'bank1',
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
        console.log("75 componentDidMount bankName:",that.state.bankBusinessName," bankId:",that.state.bankId," clientId:", that.state.clientId," sumOfCredit:", that.state.sumOfCredit-0);
        CreditAction.createAsync({'bankId':that.state.bankId, 'clientId':that.state.clientId, 'sum':that.state.sumOfCredit}, {})
            .then(()=>{
                console.log('61 Ok state', that.state.bankBusinessName);
            })
            .catch(err=>{
                console.log('64 CreditAction create err', err);
            });
    }

    render(){
        let that = this;
        console.log("106 render this.state.bankId:", this.state.bankId," this.state.bankBusinessName:",this.state.bankBusinessName);
        let num = -1;
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
                         <input
                             type="button"
                             value="CreateCredit"
                             className="login-submit-button btn btn-main btn-big"
                             {/*className="login-submit-button btn btn-main btn-big"*/}
                             onClick = {this.handleCreateCredit}
                         />
                    </Col>

                </Row>
                {/*</Form>*/}
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

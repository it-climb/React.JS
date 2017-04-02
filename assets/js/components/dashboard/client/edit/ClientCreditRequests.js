'use strict';
import React from 'react';
import {Table} from "react-bootstrap";
import _ from "lodash";
import  CreditAction from '../../../actions/credit';
import  BankAction from '../../../actions/bank';

class ClientCreditRequests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clientId: this.props.currentUserId,
            newRender: this.props.newRender,
            clientRequests: [],
            banksNames: [],
            rend: false
        };
        this.handleCompleteRequestStates = this.handleCompleteRequestStates.bind(this);
        this.handleGetByClientIdAsync = this.handleGetByClientIdAsync.bind(this);
    }

    componentWillMount(){
        let that = this;
        BankAction.getAllBusinessNamesAsync({}, {})
            .then(banksNames => {
                if(banksNames.length > 0) {
                    that.setState({
                        banksNames: banksNames
                    });
                    // console.log('141 banksNames:', banksNames);
                    that.handleCompleteRequestStates();
                }
            })
            .catch(err=>{
                console.log('error componentWillMount 172 banksNames', err);
            });
        this.handleGetByClientIdAsync(this.state.clientId);

    }
    handleGetByClientIdAsync(id){
        let that = this;
        CreditAction.getByClientIdAsync({'id': id}, {})
            .then(clientRequests => {
                if(clientRequests.length > 0){
                    that.setState({
                        clientRequests: clientRequests
                    });
                }
                // console.log("157 clientRequests:", clientRequests);
                that.handleCompleteRequestStates();
            })
            .catch(err => {
                console.log('ClientCreditRequests componentWillMount 169 err', err);
            });
    }
    handleCompleteRequestStates(){
        let that = this;
        if(this.state.clientRequests.length > 0 && this.state.banksNames.length > 0 ){
            let clientRequests = this.state.clientRequests;
            let banksNames = this.state.banksNames;
            let num = 0;
            clientRequests.map((cr)=>{
                let bankName = banksNames.filter((bn)=>{
                    return cr.bankId === bn.id;
                });
                clientRequests[num].bankBusinessName = bankName[0].business_name;
                num++;
            });
            that.setState({
                clientRequests: clientRequests,
                rend: true
            });
            // console.log("handleCompleteRequestStates", that.state.clientRequests);
        }
    }
    componentWillReceiveProps(nextProps)
    {
        if(this.state.newRender !== nextProps.newRender){
            console.log("componentWillReceiveProps 74");
            this.setState({
                newRender: nextProps.newRender
            });
            this.handleGetByClientIdAsync(this.state.clientId);
        }
    }

    render(){
        let clientRequests = [];
        if(this.state.rend){
            clientRequests = this.state.clientRequests;
        }
        console.log("194 clientRequests", clientRequests);
        return (
            <div className="test-dash-client">
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Bank</th>
                        <th>Sum</th>
                        <th>Confirm</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        clientRequests.map((el)=>{
                            let confirm = (el.confirm == null) ? 'In process' : el.confirm;
                            return(
                                <tr>
                                    <td>{el.requestDate}</td>
                                    <td>{el.bankBusinessName}</td>
                                    <td>{el.sum}</td>
                                    <td>{(el.confirm == null) ? 'In process' : el.confirm}</td>
                                </tr>);
                        })
                    }
                    </tbody>
                </Table>
            </div>
        );
    }

}

ClientCreditRequests.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default ClientCreditRequests;
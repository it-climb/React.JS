'use strict';
import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import _ from 'lodash';

import AdminActions from './../../actions/admin';

export default React.createClass({
    getInitialState(){
        return {period: '7 days', stats: {}}
    },
    componentDidMount(){
        this._loadData();
    },
    _loadData(){
        let {period} = this.state,
            that = this;
        AdminActions.getStatsAsync({period}, {})
            .then(stats => {
                that.setState({stats});
            })
            .catch(err => {
                console.log(err);
            });
    },
    _togglePeriod(period){
        this.setState({period});
        setTimeout(this._loadData.bind(this), -1);
    },
    render(){
        let {period, stats} = this.state;
        return <div className="test-admin-page">
            <div className="period-select">
                <ButtonGroup>
                    {
                        ['1 day', '7 days', '30 days', '90 days', '365 days'].map(value => {
                            return <Button active={period === value}
                                           onClick={this._togglePeriod.bind(this, value)}>{value}</Button>;
                        })
                    }
                    <Button active={period === '20 years'} onClick={this._togglePeriod.bind(this, '20 years')}>All
                        time</Button>
                </ButtonGroup>
            </div>

            <div className="data-wrapper">
                <div className="common">
                    <h2>Common stats:</h2>
                    <p>New Users: {stats.userCount || 0}</p>
                    <p>New Clients: {stats.clientCount || 0}</p>
                    <p>New Banks: {stats.bankCount || 0}</p>
                    <p>New Locations: {stats.createdLocationsCount || 0}</p>
                    <p>Completed Locations: {stats.completedLocationsCount || 0}</p>
                </div>
                <div className="payment">
                    <h2>Payment stats:</h2>
                    <p>New Transactions: {_.get(stats,'tx.count',0)}</p>
                    <p>Money Transferred: {_.get(stats,'tx.transferred',0)}</p>
                    <p>Money Collected: {_.get(stats,'tx.collected',0)}</p>
                </div>
            </div>
        </div>
    }
});

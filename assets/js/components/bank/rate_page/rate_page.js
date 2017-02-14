'use strict';
import React from "react";
import {Alert, Button} from "react-bootstrap";
import _ from "lodash";
import {Link} from 'react-router';
import BankActions from "./../../../actions/bank";

import AppState from "./../../../stores/app_state";

import RatingEntry from "./../../../common_components/star_rating/star_rating";

export default React.createClass({

    getInitialState(){
        return {
            loaded: false,
            rated: false,
            loadError: null,
            submitError: null,
            lab: null,
            contract: null,
            rates: {},
            description: ''
        };
    },
    _onInputChange(ev){
        let {name, value} =ev.target;
        this.setState({[name]: value});
    },
    _onRateChange(rating, criterion){
        let {rates} = this.state;
        rates[criterion] = rating;
        this.setState({rates})
    },
    _onRateSubmit(){
        let {id} = this.state.Bank;
        let rating = {
            comment: this.state.description,
            rating: _.map(this.state.rates, (rating, criterion) => {
                return {type: criterion, value: rating};
            })
        };
        BankActions.rateAsync({id, rating}, {})
            .then(this.setState.bind(this, {rated: true}, void(0)))
            .catch(submitError => this.setState({submitError}));
    },
    _renderError(submitError){
        return (!!_.get(submitError, 'response.body.details'))
            ?
            _.map(submitError.response.body.details.errors, errorText => {
                return <Alert bsStyle="danger">{errorText}</Alert>
            })
            :
            <Alert bsStyle="danger">{submitError.response.body.message}</Alert>
    },
    render(){
        if (!this.state.loaded) {
            return <div>loading</div>;
        }
        if (!!this.state.loadError) {
            return <Alert bsStyle="danger">{_.get(this.state.serverError, 'response.body.message')}</Alert>
        }

        let {Bank, contract, rated, submitError} = this.state;

        return <div className="test-bank-rate container">
            <h1 className="first-headliner">Thank You</h1>
            <h4>Contract successfully paid. Please rate bank</h4>

            <div className="row">
                <div className="col-md-offset-4 col-md-4">
                    <a href={`/banks/${bank.id}`}>
                    <div className="rate-bank-logo">
                            <h2>{Bank.User.firstName} {Bank.User.lastName}</h2>
                            <h4>{Bank.name}</h4>
                    </div>
                    </a>
                    {
                        rated &&
                        <Alert bsStyle="success">
                            <p>Thank you for your review</p>
                            <p><Link to="/dashboard">Take me to the dashboard</Link></p>
                        </Alert>
                    }
                    {
                        submitError && this._renderError(submitError)
                    }
                    {
                        !rated &&
                        <div>
                            <div className="rate-bank-params">
                                {
                                    _.map(AppState.appState.ratingCriteria, criterion => {
                                        return <RatingEntry label={criterion} rating={~~this.state.rates[criterion]}
                                                            readOnly={false}
                                                            selectCallback={this._onRateChange.bind(this)}/>
                                    })
                                }
                            </div>
                            <div className="rate-bank-comment form-group">
                <textarea placeholder="Comment" className="form-control"
                          name="description" value={this.state.description}
                          rows="6" onChange={this._onInputChange.bind(this)}/>
                            </div>
                            <div className="rate-bank-submit">
                                <Button disabled={!!submitError || this.state.rated}
                                        className="rate-submit-button btn-main"
                                        onClick={this._onRateSubmit.bind(this)}>rate</Button>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    }
});
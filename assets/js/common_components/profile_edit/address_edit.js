'use strict';
import React from "react";
import _ from 'lodash';
import {Row, Col, FormGroup, FormControl,HelpBlock, ControlLabel} from "react-bootstrap";

export default React.createClass({
    propTypes: {
        location: React.PropTypes.object.isRequired,
        onChange: React.PropTypes.func.isRequired,
        errors: React.PropTypes.object.isRequired,
        disabled: React.PropTypes.bool
    },
    getDefaultProps(){
        return {disabled: false};
    },
    _onInputChange(ev){
        let {onChange} = this.props,
            {name, value} = ev.target;
            name = `location.${name}`;
        onChange(name, value);
    },
    render(){
        let {location:entry, disabled, errors} = this.props;

        let onChange = this._onInputChange.bind(this),
            commonProps = {onChange, disabled, readOnly: disabled},
            validationError = {validationState: 'error'},
            getValidationBlock = (fieldName)=>_.isString(_.get(errors, fieldName)) ?
                <HelpBlock>{_.get(errors,fieldName)}</HelpBlock> : null;


        return <Row>
            <Col lg={12} md={12} xs={12} sm={12}>
                <FormGroup  {...(_.get(errors, 'line1') && validationError)}>
                    <ControlLabel>Address Line 1</ControlLabel>
                    <FormControl name="line1" {...commonProps}
                                 placeholder="Address Line 1" value={_.get(entry,'line1','')}/>
                    <FormControl.Feedback/>
                    {getValidationBlock('line1')}
                </FormGroup>
                <FormGroup  {...(_.get(errors, 'line2') && validationError)}>
                    <ControlLabel>Address Line 2</ControlLabel>
                    <FormControl name="line2" {...commonProps}
                                 placeholder="Address Line 2" value={_.get(entry,'line2','')}/>
                    <FormControl.Feedback/>
                    {getValidationBlock('line2')}

                </FormGroup>
                <Row>
                    <Col md={6} xs={6} lg={6} sm={6}>
                        <ControlLabel>City</ControlLabel>
                        <FormGroup  {...(_.get(errors, 'city') && validationError)}>
                            <FormControl name="city" {...commonProps}
                                         placeholder="City" value={_.get(entry,'city','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('city')}

                        </FormGroup>
                    </Col>
                    <Col md={2} xs={2} lg={2} sm={2} className="p0">
                        <FormGroup  {...(_.get(errors, 'state') && validationError)}>
                            <ControlLabel>State</ControlLabel>
                            <FormControl name="state" {...commonProps} maxLength="2"
                                         placeholder="State" value={_.get(entry,'state','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('state')}

                        </FormGroup>
                    </Col>
                    <Col md={4} xs={4} lg={4} sm={4}>
                        <FormGroup  {...(_.get(errors, 'postal_code') && validationError)}>
                            <ControlLabel>Zip</ControlLabel>
                            <FormControl name="postal_code" {...commonProps} maxLength="5"
                                         placeholder="ZIP" value={_.get(entry,'postal_code','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('postal_code')}
                        </FormGroup>
                    </Col>
                </Row>
            </Col>
        </Row>
    }
});
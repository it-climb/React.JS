'use strict';
import React from "react";
import _ from "lodash";
import {Row, Col, FormGroup, FormControl, Button, HelpBlock,InputGroup, ControlLabel} from "react-bootstrap";
import Logo from "./../logo/logo";

export default React.createClass({
    propTypes: {
        entry: React.PropTypes.object.isRequired,
        errors: React.PropTypes.object.isRequired,
        onChange: React.PropTypes.func.isRequired
    },

    _onInputChange(ev){
        let {onChange} = this.props,
            {name, value} = ev.target;
        onChange(name, value);
    },

    render(){
        let {entry, onChange:mainChange, errors} = this.props,
            onChange = this._onInputChange.bind(this),
            validationError = {validationState: 'error'},
            getValidationBlock = (fieldName)=>_.isString(_.get(errors, fieldName)) ?
                <HelpBlock>{_.get(errors,fieldName)}</HelpBlock> : null;
        return <div className="test-edit-profile">
            <h2 className="secondary-headliner">Business Information</h2>
                <Row>
                    <Col md={4} xs={4} lg={4} sm={4}>
                        <h4>General</h4>
                        <FormGroup>
                            <ControlLabel>Company Logo</ControlLabel>
                            <Logo entry={entry}/>
                            <label className="btn btn-simple btn-upload-logo">
                                <input type="file" accept="image/*" name="logo" onChange={ev=>mainChange('logo',ev.target.files[0])}/>
                                <span>Upload Logo</span>
                            </label>

                        </FormGroup>
                        <FormGroup {...(errors['name'] && validationError)}>
                            <ControlLabel>Business Name</ControlLabel>
                            <FormControl name="businessName" placeholder="Business Name" value={_.get(entry,'businessName','')}
                                         onChange={onChange}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('name')}
                        </FormGroup>
                    </Col>
                    <Col md={4} xs={4} lg={4} sm={4}>
                        <h4>Contact Info</h4>
                        <ControlLabel>Contact Person</ControlLabel>
                        <Row>
                            <Col md={6} xs={6} lg={6} sm={6} className="first-name">
                                <FormGroup  {...(_.get(errors, 'firstName') && validationError)}>
                                    <FormControl name="firstName" onChange={onChange}
                                                 placeholder="First Name"
                                                 value={_.get(entry, 'firstName','')}/>
                                    <FormControl.Feedback/>
                                    {getValidationBlock('firstName')}
                                </FormGroup>
                            </Col>
                            <Col md={6} xs={6} lg={6} sm={6} className="second-name">
                                <FormGroup {...(_.get(errors, 'lastName') && validationError)}>
                                    <FormControl name="lastName" onChange={onChange}
                                                 placeholder="Last Name"
                                                 value={_.get(entry, 'lastName','')}/>
                                    <FormControl.Feedback/>
                                    {getValidationBlock('lastName')}
                                </FormGroup>
                            </Col>

                        </Row>
                        <FormGroup  {...(_.get(errors, 'User.email') && validationError)}>
                            <ControlLabel>Contact Email</ControlLabel>
                            <FormControl name="User.email" onChange={onChange}
                                         placeholder="Email" className="text-lowercase"
                                         value={_.get(entry, 'User.email','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('User.email')}
                        </FormGroup>
                        <FormGroup {...(_.get(errors, 'phone') && validationError)}>
                            <ControlLabel>Contact Phone</ControlLabel>
                            <FormControl name="phone" onChange={onChange}
                                         placeholder="Phone"
                                         value={_.get(entry,'phone','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('phone')}
                            <ControlLabel>Mobile Phone</ControlLabel>
                            <FormControl name="mobilePhone" onChange={onChange}
                                         placeholder="Phone"
                                         value={_.get(entry,'mobilePhone','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('mobilePhone')}
                        </FormGroup>
                    </Col>
                    <Col md={4} xs={4} lg={4} sm={4}>
                        <h4>Update Password</h4>
                        <FormGroup {...(_.get(errors, 'User.oldPassword') && validationError)}>
                            <ControlLabel>Current Password</ControlLabel>
                            <FormControl name="User.oldPassword" placeholder="Current Password"
                                         type="password" onChange={onChange}
                                         value={_.get(entry, 'User.oldPassword','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('User.oldPassword')}
                        </FormGroup>
                        <FormGroup {...(_.get(errors, 'User.newPassword') && validationError)}>
                            <ControlLabel>New Password</ControlLabel>
                            <FormControl name="User.newPassword" onChange={onChange}
                                         type="password"
                                         placeholder="New Password" value={_.get(entry, 'User.newPassword','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('User.newPassword')}

                        </FormGroup>
                        <FormGroup {...(_.get(errors, 'User.confirmPassword') && validationError)}>
                            <ControlLabel>New Password Repeat</ControlLabel>
                            <FormControl name="User.confirmPassword" onChange={onChange}
                                         type="password"
                                         placeholder="New Password Repeat"
                                         value={_.get(entry, 'User.confirmPassword','')}/>
                            <FormControl.Feedback/>
                            {getValidationBlock('User.confirmPassword')}
                        </FormGroup>
                    </Col>
                </Row>
        </div>
    }
});
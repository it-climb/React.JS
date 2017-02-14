'use strict';
import React from "react";
import _ from 'lodash';
import {Navbar, Nav, NavItem, Button, NavDropdown, MenuItem, Modal, Row, Col} from "react-bootstrap";
import {browserHistory, Link} from "react-router";
import Footer from './../../common_components/footer/footer';

export default React.createClass({
    getInitialState(){
        return {
            showVideo: false
        }
    },
    _handleGoTo(goToPage){
        browserHistory.push(goToPage);
    },

    _getLoginHeader(){
        return <Nav pullRight>
            <NavItem eventKey={1} onClick={this._handleGoTo.bind(this, '/login')}>login</NavItem>
            <Button className="btn btn-sign-up" onClick={this._handleGoTo.bind(this, '/register')}>
                Sign Up Free
            </Button>
        </Nav>
    },
    _getLogoutHeader(){
        let {currentUser} = this.props,
            isDentist = _.isNull(_.get(currentUser, 'Lab')),
            businessName = _.get(_.get(currentUser, 'Lab') || _.get(currentUser, 'Dentist'), 'name');
        return <Nav pullRight>
            <NavDropdown eventKey={3}
                         title={!!businessName && businessName.length > 20 ? `${businessName.substring(0, 20)}...` : businessName}
                         id="basic-nav-dropdown" className="credentials">
                <MenuItem eventKey={3.1}
                          onClick={this._handleGoTo.bind(this, isDentist ? '/dashboard/dentists' : '/dashboard/labs')}>Dashboard</MenuItem>
                <MenuItem eventKey={3.2}
                          onClick={this._handleGoTo.bind(this, isDentist ? '/cases/new' : '/cases/search')}>{isDentist ? 'Add case' : 'Find Case'}</MenuItem>
                <NavItem eventKey={1} href='/api/sessions/logout'>Logout</NavItem>
            </NavDropdown>
        </Nav>
    },
    render(){
        let {currentUser} = this.props;

        return (
            <div className="main-page">
                <section className="home-page">
                    <header className="home-header">
                        <Navbar fluid={true}>
                            <Navbar.Header>
                                <Navbar.Brand>
                                    <a href="#" className="brand_logo" title="logo">
                                       IT-Climb
                                    </a>
                                </Navbar.Brand>
                                <Navbar.Toggle />
                            </Navbar.Header>
                            <Navbar.Collapse>
                                {_.isEmpty(currentUser) ? this._getLoginHeader() : this._getLogoutHeader()}
                            </Navbar.Collapse>
                        </Navbar>
                    </header>
                    <div className="centered-section">

                    </div>
                </section>

                <Footer/>
            </div>

        )
    }
})
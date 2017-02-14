'use strict';
import React from "react";
import {Glyphicon, Navbar, Nav, NavItem, NavDropdown, MenuItem} from "react-bootstrap";
import _ from "lodash";
import {browserHistory} from "react-router";

export default React.createClass({

    getDefaultProps(){
        return ({
            user: {}
        })
    },

    _handleGoTo(goToPage) {
        return browserHistory.push.bind(browserHistory, goToPage);
    },

    _getDefaultHeader() {
        return (
            <Nav>
                {window.location.pathname.indexOf('register') >= 0 &&
                <NavItem onClick={this._handleGoTo('/login')}>Login</NavItem>}
                {window.location.pathname.indexOf('login') >= 0 &&
                <NavItem onClick={this._handleGoTo('/register')}>Register</NavItem>}
            </Nav>
        );
    },
    _getProperHeader(user){
        let businessName = user.Role.name === "admin" ? user.Role.title
            :user.Role.name === 'bank' ? _.get(user, 'Bank.businessName', 'UserName')
            : _.get(user, 'Client.businessName', 'UserName');
        return <Nav>
            <NavItem eventKey={1}
                     onClick={this._handleGoTo( '/dashboard')}><i
                className="material-icons">&#xE85C;</i>Dashboard</NavItem>
            <NavDropdown eventKey={3}
                         title={businessName.length > 20 ? `${businessName.substring(0, 20)}...` : businessName}
                         id="basic-nav-dropdown"
                         className="credentials">
                <MenuItem eventKey={3.1} href='/api/sessions/logout'><i
                    className="material-icons">&#xE8AC;</i>Logout</MenuItem>
                <MenuItem eventKey={3.2}
                         onClick={this._handleGoTo(`/dashboard/edit`)}><i
                    className="material-icons">&#xE8B8;</i>Settings</MenuItem>

            </NavDropdown>
        </Nav>
    },

    _getRegularHeader(){
        let {user} = this.props;
        return <Nav pullRight>
            {user
                ? this._getProperHeader()
                : this._getDefaultHeader()
            }
        </Nav>
    },

    _getHomeHeader(){
        let {user} = this.props;
        user ? this._getLoginHeader() : this._getLogoutHeader()
    },

    _getLoginHeader(){
        return <Nav pullRight>
            <NavItem eventKey={1} onClick={this._handleGoTo.bind(this, '/login')}>login</NavItem>
            <button className="btn btn-sign-up" onClick={this._handleGoTo.bind(this, '/register')}>
                Sign Up Free
            </button>
        </Nav>
    },

    _getLogoutHeader(){
        let {user} = this.props,
            businessName = _.get(user, 'name', 'BusinessName');
        return <Nav pullRight>
            <NavDropdown eventKey={3}
                         title={!!businessName && businessName.length > 20 ? `${businessName.substring(0, 20)}...` : businessName}
                         id="basic-nav-dropdown" className="credentials">
                <MenuItem eventKey={3.1}
                          onClick={this._handleGoTo.bind(this, '/dashboard')}>Dashboard</MenuItem>
                <MenuItem eventKey={3.2}
                          onClick={this._handleGoTo.bind(this, '/search')}>Find Case</MenuItem>
                <NavItem eventKey={1} href='/api/sessions/logout'>Logout</NavItem>
            </NavDropdown>
        </Nav>
    },

    render(){
        let {user} = this.props;
        return <header className="test-page-header">
            <Navbar fluid={true}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="/" className="brand_logo" title="logo">
                            IT-Climb
                        </a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        {user
                            ? this._getProperHeader(user)
                            : this._getDefaultHeader()
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </header>
    }
});
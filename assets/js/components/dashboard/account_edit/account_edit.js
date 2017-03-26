'use strict';
import _ from "lodash";
import React from 'react';
import RoleUtils from './../../../utils/role_utils';
import Header from './../../../common_components/header/header';

class AccountEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accountEditMap: RoleUtils.initAccountMap(this)
        }
    }

    render() {
        let accountEdit = this.state.accountEditMap.get(this.props.currentUser.Role.name);
        return (
            <div className=" test-account-edit">
                <Header user={this.props.currentUser}/>
                <div className="container">
                    {accountEdit}
                </div>
            </div>
        );
    }
}

AccountEdit.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    //current logged in user or null
    stores: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.object.isRequired
};

export default AccountEdit;


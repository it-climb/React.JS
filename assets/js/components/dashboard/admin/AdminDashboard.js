'use strict';
import _ from "lodash";
import React from 'react';

import Admin from '../../admin/admin'

class AdminDashboard extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <Admin/>;
    }
}

AdminDashboard.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default AdminDashboard;
'use strict';
import React from 'react';

class ClientDashboard extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="test-dash-client">
            </div>
        );
    }
}

ClientDashboard.propTypes = {
    //contains URI params
    params: React.PropTypes.object.isRequired,
    //contains all the stores
    stores: React.PropTypes.object.isRequired,
    //current logged in user or null
    currentUser: React.PropTypes.object.isRequired
};

export default ClientDashboard;

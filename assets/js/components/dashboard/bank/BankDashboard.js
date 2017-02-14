'use strict';

import React from 'react';

class BankDashboard extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="dash">

            </div>
        );
    }
}

BankDashboard.propTypes = {
    params: React.PropTypes.object.isRequired,
    stores: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.object.isRequired
};

export default BankDashboard;
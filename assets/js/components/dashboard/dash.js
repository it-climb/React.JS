'use strict';
import React from "react";
import {browserHistory} from "react-router";

export default React.createClass({
    propTypes: {
        currentUser: React.PropTypes.object.isRequired
    },
    componentWillMount(){

    },
    render(){
        return <div>
            <h1>Something is wrong</h1>
            <h3>You weren't supposed to see this page</h3>
        </div>;
    }
});
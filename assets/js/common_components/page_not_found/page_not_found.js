'use strict';
import React from "react";
import {Link} from "react-router";

class PageNotFound extends React.Component {

    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="center-block col-md-12">
                        <h1>It's not the page you're looking for.</h1>
                        <h3>You should go away from here</h3>
                        <h3>¯\_(ツ)_/¯</h3>

                        <p><Link to="/">Home Page</Link></p>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageNotFound;
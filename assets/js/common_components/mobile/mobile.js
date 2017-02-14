'use strict';
import React from "react";
import {Link} from "react-router";

class Mobile extends React.Component {

    render() {
        return (
            <div className="container mobile">
                <div className="row">
                    <div className="col-md-4 col-md-offset-4 col-sm-12">
                      <h4 className="fourth-headliner">
                          IT-Climb
                      </h4>
                        <i className="material-icons desktop">&#xE30B;</i>
                        <p className="regular">Hi! </p>
                        <p className="regular">Have a great day!</p>
                        <p className="regular">Team IT-Climb</p>
                        <a href="/" className="btn btn-main">Continue to Desktop Website</a>
                    </div>
                </div>
            </div>
        )
    }
}

export default Mobile;

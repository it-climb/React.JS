'use strict';

import React            from 'react';
import moment           from 'moment';

export default React.createClass({
    render(){
        return <footer className="test-footer">
            <div className="inner-footer">
                <span className="copiright">&copy;IT-Climb&nbsp;{moment().year()}</span>
                <ul className="list-footer-of-links">
                    <li className="item-footer-link">
                        <a href="/about" className="footer-link">
                            About us
                        </a>
                    </li>
                    <li className="item-footer-link">
                        <a href="/faq" className="footer-link">
                            FAQ
                        </a>
                    </li>
                    <li className="item-footer-link">
                        <a href="/contact-us" className="footer-link">
                            Contact us
                        </a>
                    </li>
                    <li className="item-footer-link social-link">
                        <a href="#"  target="_blank"  className="fa fa-facebook-square"/>
                    </li>
                    <li className="item-footer-link social-link">
                        <a href="#" target="_blank" className="fa fa-twitter"/>
                    </li>
                    <li className="item-footer-link social-link">
                        <a href="#"  target="_blank"  className="fa fa-linkedin-square"/>
                    </li>
                </ul>
            </div>
        </footer>
    }
});
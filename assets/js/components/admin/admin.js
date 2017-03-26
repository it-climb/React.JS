'use strict';
import React from 'react';
import {render} from 'react-dom';
import {
    Row,
    Col,
    Navbar,
    Nav,
    NavItem,
    ListGroup,
    ListGroupItem,
    Panel,
    PanelGroup,
    Tabs,
    Tab,
    Alert
} from 'react-bootstrap';
import _ from 'lodash';
import Stats from '../../common_components/stats/stats';


export default React.createClass({

    render() {
        return <div className="react-admin">
            <section className="container">
                                 <Tabs  defaultActiveKey={1}>
                                     <Tab eventKey={2} title='Stats'>
                                         <Stats/>
                                     </Tab>
                                 </Tabs>
            </section>
        </div>;
    }

});
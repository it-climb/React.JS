'use strict';
import _ from 'lodash';
import React from 'react';
import AdminDashboard from './../components/dashboard/admin/AdminDashboard';
import BankDashboard from '../components/dashboard/bank/BankDashboard';
import ClientDashboard from '../components/dashboard/client/ClientDashboard';
import ClientEdit from '../components/dashboard/client/edit/edit';
import BankEdit from '../components/dashboard/bank/edit/edit';
let RoleUtils = {

    getRoles: () => ['admin', 'bank', 'client'],

    initDashboardMap: ($this) =>{
        let dashboardsMap = new Map();
        dashboardsMap.set('admin', (<AdminDashboard {...$this.props}/>));
        dashboardsMap.set('bank', (<BankDashboard {...$this.props}/>));
        dashboardsMap.set('client', (<ClientDashboard {...$this.props}/>));
        return dashboardsMap;
    },

    initAccountMap: ($this) =>{
        let accountEditMap = new Map();
        accountEditMap.set('bank', (<BankEdit {...$this.props}/>));
        accountEditMap.set('client', (<ClientEdit {...$this.props}/>));
        return accountEditMap;
    },
};

export default RoleUtils;

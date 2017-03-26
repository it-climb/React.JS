'use strict';
import RefluxStoresCrud from "../utils/reflux_stores_crud";
import userActions from "../actions/user";

export default RefluxStoresCrud(userActions, {
    onGetMeCompleted(res) {
        this.onGetOneCompleted(res);
    }
});
import Reflux           from 'reflux';
import RefluxStoresCrud from '../utils/reflux_stores_crud';

// ACTIONS
import sessionActions  from '../actions/session';

export default RefluxStoresCrud(sessionActions, {});
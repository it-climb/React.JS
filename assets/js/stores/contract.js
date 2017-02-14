import Reflux           from 'reflux';
import RefluxStoresCrud from '../utils/reflux_stores_crud';

// ACTIONS
import contractActions  from '../actions/contract';

export default RefluxStoresCrud(contractActions, {});
import Reflux           from 'reflux';
import RefluxStoresCrud from '../utils/reflux_stores_crud';

// ACTIONS
import attachmentActions  from '../actions/attachment';

export default RefluxStoresCrud(attachmentActions, {});
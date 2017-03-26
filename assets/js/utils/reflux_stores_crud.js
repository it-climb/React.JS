import Reflux   from 'reflux';
import _        from 'lodash';
import moment   from 'moment';


/**
 * @export RefluxStoresCrud
 * @desc This is a function to help setup Reflux Actions for CRUD operations.  Simply pass in which endpoints you want
 * the service to support.  i.e. `getOne`, `getAll`, `create`, `update` & `delete`.  Then all the hard work is done for
 * you.  Works in conjunction with `RefluxStoresCrud`.  Then you can pass in additional actions using the `extend`
 * param.
 *
 * @returns `Reflux Store` function object.
 *
 * @param {RefluxActions} actions - This is the actual Reflux Actions function object that is returned by running
 * Reflux.createActions().  This should be the Reflux Actions function object that was created for this CRUD service.
 *
 * @param {object} [extend] - Additional store callbacks you want supported. ex: 'onClearCache'.  You'll also need to extend the
 * RefluxActionsCrud to add the additional actions as well.
 */
export default function (actions, extend) {

    let store = {
        listenables: actions,

        // STORE METHODS
        markDirty(id){
            this.addHiddenProperty(this.items[id], "dirty");

            this.items[id].dirty = true;
        },

        addCacheDate(obj) {
            this.addHiddenProperty(obj, "cacheDate");
            obj.cacheDate = moment();
        },

        addHiddenProperty(obj, property) {
            Object.defineProperty(obj, property, {
                enumerable: false,
                writable: true
            });
        },

        onAddToStore(item) {
            this.items[item.id] = item;
            if(this.items.totalCount){
                this.items.totalCount++;
            }
            this.addCacheDate(this.items[item.id]);
            this.updateApp();
        },

        onAddAllToStore(items, totalCount){
            items.forEach((item, i) => {
                if (this.items[item.id] == undefined)
                    this.items[item.id] = item;
                else
                    this.items[item.id] = _.merge(_.clone(this.items[item.id]), item);

                this.addCacheDate(this.items[item.id]);
            });
            if(!_.isUndefined(totalCount)) {
                this.items.totalCount = totalCount;
            }
            this.addCacheDate(this.items);
            this.updateApp();
        },

        onUpdateInStore(item, dirty){
            this.items[item.id] = _.merge(_.clone(this.items[item.id]), item);

            if (dirty === true) this.markDirty(item.id);
            this.updateApp();
        },

        onCreateInStore(item, dirty) {
            this.items[item.id] = item;

            if (dirty === true) {
                this.markDirty(item.id);
            }
            this.updateApp();
        },

        onCleanStore() {
            this.items = this._initItems();

            this.updateApp();
        },

        onDeleteFromStore(item){
            delete this.items[item.id];
            if(this.items.totalCount){
                this.items.totalCount--;
            }
            this.updateApp();
        },

        // GET ONE
        onGetOneCompleted(res){
            if (!res) {
                return;
            }
            if (!!this.items[res.id]) {
                this.onUpdateInStore(res, false);
            } else {
                this.onAddToStore(res);
            }
        },

        onGetOneFailed(err){
            console.error("FAILED!", err);
        },

        // GET ALL
        onGetAllCompleted(res){
            if(res.data){
                this.onAddAllToStore(res.data, res.totalCount);
            }else{
                this.onAddAllToStore(res);
            }

        },

        onGetAllFailed(err){
            console.error("FAILED!", err)
        },

        // UPDATE
        onUpdateCompleted(res){
            let item = this.items[res.id];
            if (item) {
                if (item.dirty === true) item.dirty = false;
                this.onUpdateInStore(res);
            } else {
                this.onAddToStore(res);
            }
        },

        onUpdateFailed(err){
            console.error("FAILED!", err)
        },

        // CREATE
        onCreateCompleted(res){
            this.onAddToStore(res);
        },

        onCreateFailed(err){
            console.error("FAILED!", err);
        },

        // DELETE
        onDeleteCompleted(res){
            this.onDeleteFromStore(res);
        },

        onDeleteFailed(err){
            console.error("FAILED!", err)
        },

        /**
         * @method updateApp
         * @desc Triggers the rest of the app to update to the current models.  Can't be accessed outside of Store.
         */
        updateApp() {
            // Causes rest of app to update
            this.trigger(this.items);
        },

        /**
         * @method getInitialState
         * @desc Sets and returns initial App State.
         */
        getInitialState() {
            this.items = this._initItems();
            return this.items;
        },

        _initItems(){
            let items = {};
            this.addHiddenProperty(items, "totalCount");
            return items;
        }

    };

    // Add `extend` operations to store
    store = _.merge(store, extend);

    return Reflux.createStore(store);
}
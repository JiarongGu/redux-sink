import { ReducersMapObject, Store, Reducer } from 'redux';
import { buildReducers } from './buildReducers';

export class SinkFactory {
  static _store?: Store;
  static reducers: ReducersMapObject<any, any> = {};
  static sinkStateUpdaters: { [key: string]: (state: any) => void } = {};

  static applyReduxSinkStore(store: Store) {
    this._store = store;
    if (!this._store) return;

    const state = store.getState() || {};
    Object.keys(this.sinkStateUpdaters).forEach(key => this.sinkStateUpdaters[key](state[key]));
    this.rebuildReducer();
  }

  static addReducer(namespace: string, reducer: Reducer<any, any>, sinkStateUpdater: (state: any) => void) {
    if (!this._store) return;
    
    this.reducers[namespace] = reducer;
    this.sinkStateUpdaters[namespace] = sinkStateUpdater;
    this.rebuildReducer();
  }

  static rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this._store!.replaceReducer(reducer);
  }

  static get store() {
    return this._store;
  }
}
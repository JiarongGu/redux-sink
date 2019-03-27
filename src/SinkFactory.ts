import { ReducersMapObject, Store, Reducer } from 'redux';
import { buildReducers } from './buildReducers';
import { PayloadHandler, StoreConfiguration, ISinkFacotry } from './typings';
import { configureStore } from './configureStore';
import { effectMiddleware } from './effectsMiddleware';
import { triggerMiddleware } from './triggerMiddleware';

export class SinkFactory {
  static _store?: Store;
  static reducers: ReducersMapObject<any, any> = {};
  static sinkStateUpdaters: { [key: string]: (state: any) => void } = {};
  static effectHandlers = new Map<string, PayloadHandler>();
  static triggerHandlers = new Map<string, Array<{ priority: number, handler: PayloadHandler }>>();
  static reloaders: { [key: string]: any } = {};

  static createStore<TState = any>(config?: StoreConfiguration<TState>) {
    let middlewares = [triggerMiddleware, effectMiddleware];
    if (config && config.middlewares)
      middlewares = middlewares.concat(config.middlewares);

    const store = configureStore({ ...config, middlewares });
    this.applyReduxSinkStore(store);
    return store;
  }

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

  static addEffect(action: string, handler: PayloadHandler) {
    this.effectHandlers.set(action, handler);
  }
  
  static addTrigger(action: string, handler: PayloadHandler, priority?: number) {
    let handlers = this.triggerHandlers.get(action);
    if (!handlers) {
      this.triggerHandlers.set(action, handlers = []);
    }
    handlers.push({ handler, priority: priority || 0 });
    handlers.sort((a, b) => b.priority - a.priority);

    if (this.reloaders[action] !== undefined)
      handler(this.reloaders[action]);
  }

  static addReloader(action: string, payload: any = null) {
    this.reloaders[action] = payload;
  }

  static rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this._store!.replaceReducer(reducer);
  }

  static get store() {
    return this._store;
  }
}
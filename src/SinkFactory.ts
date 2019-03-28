import { ReducersMapObject, Store, Reducer } from 'redux';
import { buildReducers } from './buildReducers';
import { PayloadHandler, StoreConfiguration, Action } from './typings';
import { configureStore } from './configureStore';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { createTriggerMiddleware } from './createTriggerMiddleware';

export class SinkFactory {
  static __store__?: Store;
  static reducers: ReducersMapObject<any, any> = {};
  static sinkStateUpdaters: { [key: string]: (state: any) => void } = {};

  static effectHandlers = new Map<string, PayloadHandler>();
  static triggerHandlers = new Map<string, Array<{ priority: number, handler: PayloadHandler }>>();

  static reloaders: { [key: string]: any } = {};
  static effectTasks: Array<Promise<any>> = [];

  static createStore<TState = any>(config?: StoreConfiguration<TState>) {
    let middlewares = [
      createTriggerMiddleware(this),
      createEffectMiddleware(this)
    ];

    if (config && config.middlewares)
      middlewares = middlewares.concat(config.middlewares);

    const store = configureStore({ ...config, middlewares });
    this.applyReduxSinkStore(store);
    return store;
  }

  static applyReduxSinkStore(store: Store) {
    this.__store__ = store;
    if (!this.__store__) return;

    const state = this.__store__.getState() || {};
    Object.keys(this.sinkStateUpdaters).forEach(key => this.sinkStateUpdaters[key](state[key]));
    this.rebuildReducer();
  }

  static addReducer(namespace: string, reducer: Reducer<any, any>, sinkStateUpdater: (state: any) => void) {
    if (!this.__store__) return;

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
    this.__store__!.replaceReducer(reducer);
  }

  static async runTriggerEvents(action: Action) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers)
      await Promise.all(triggers.map(trigger => trigger.handler(action.payload)));
  }

  static get store() {
    return this.__store__;
  }
}
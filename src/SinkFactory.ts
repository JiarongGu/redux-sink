import { ReducersMapObject, Store, Reducer } from 'redux';
import { buildReducers } from './buildReducers';
import { PayloadHandler, StoreConfiguration, Action } from './typings';
import { configureStore } from './configureStore';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { createTriggerMiddleware } from './createTriggerMiddleware';
import { SinkBuilder } from './SinkBuilder';

export class SinkFactory {
  _store?: Store;
  reducers: ReducersMapObject<any, any> = {};
  sinkStateUpdaters: { [key: string]: (state: any) => void } = {};

  effectHandlers = new Map<string, PayloadHandler>();
  triggerHandlers = new Map<string, Array<{ priority: number, handler: PayloadHandler }>>();

  reloaders: { [key: string]: any } = {};
  effectTasks: Array<Promise<any>> = [];
  sinkBuilders: Array<SinkBuilder> = [];

  createStore<TState = any>(config?: StoreConfiguration<TState>) {
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

  applyReduxSinkStore(store: Store) {
    this._store = store;
    if (!this._store) return;

    const state = store.getState() || {};
    Object.keys(this.sinkStateUpdaters).forEach(key => this.sinkStateUpdaters[key](state[key]));
    this.rebuildReducer();
  }

  addReducer(namespace: string, reducer: Reducer<any, any>, sinkStateUpdater: (state: any) => void) {
    if (!this._store) return;
    
    this.reducers[namespace] = reducer;
    this.sinkStateUpdaters[namespace] = sinkStateUpdater;
    this.rebuildReducer();
  }

  addEffect(action: string, handler: PayloadHandler) {
    this.effectHandlers.set(action, handler);
  }
  
  addTrigger(action: string, handler: PayloadHandler, priority?: number) {
    let handlers = this.triggerHandlers.get(action);
    if (!handlers) {
      this.triggerHandlers.set(action, handlers = []);
    }
    handlers.push({ handler, priority: priority || 0 });
    handlers.sort((a, b) => b.priority - a.priority);

    if (this.reloaders[action] !== undefined)
      handler(this.reloaders[action]);
  }

  addReloader(action: string, payload: any = null) {
    this.reloaders[action] = payload;
  }

  rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this._store!.replaceReducer(reducer);
  }

  async runTriggerEvents(action: Action) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers)
      await Promise.all(triggers.map(trigger => trigger.handler(action.payload)));
  }

  contains(builder: SinkBuilder) {
    return this.sinkBuilders.indexOf(builder) > 0;
  }

  get store() {
    return this._store;
  }
}

export const CommonSinkFactory = new SinkFactory();

export function createSinkStore<TState = any> (config?: StoreConfiguration<TState>) {
  return CommonSinkFactory.createStore(config);
}
import { ReducersMapObject, Store, Reducer } from 'redux';
import { PayloadHandler, Action, TriggerOptions } from './typings';
import { SinkBuilder } from './SinkBuilder';
import { buildReducers } from './buildReducers';
import { combineReducer } from './combineReducer';

export class SinkContainer {
  store?: Store;
  reducers: ReducersMapObject<any, any> = {};

  effectHandlers = new Map<string, PayloadHandler>();
  effectTasks: Array<Promise<any>> = [];

  triggerHandlers = new Map<string, Array<{ priority: number, handler: PayloadHandler }>>();
  payloads: { [key: string]: any } = {};

  sinks: { [key: string]: SinkBuilder } = {};

  runTriggerEvents(action: Action) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers) {
      const tasks = triggers.map(trigger => trigger.handler(action.payload));
      return Promise.all(tasks);
    }
    return Promise.resolve([]);
  }

  setStore(store: Store) {
    this.store = store;
    if (!this.store) return;

    // update sink state if there is preloaded state
    const state = this.store.getState() || {};
    Object.keys(this.sinks).forEach(key => {
      const sinkState = state[key];
      if (sinkState !== undefined)
        this.sinks[key].setState(sinkState)
    });
    this.rebuildReducer();
  }

  addReducer(namespace: string, reducer: Reducer<any, any>) {
    if (!this.store) return;

    this.reducers[namespace] = reducer;
    this.rebuildReducer();
  }

  addEffect(action: string, handler: PayloadHandler) {
    this.effectHandlers.set(action, handler);
  }

  addTrigger(actionType: string, handler: PayloadHandler, options?: TriggerOptions) {
    let handlers = this.triggerHandlers.get(actionType);
    if (!handlers) {
      this.triggerHandlers.set(actionType, handlers = []);
    }
    const priority = options && options.priority || 0;
    const fireOnInit = options && options.fireOnInit;

    handlers.push({ handler, priority });
    
    if (priority > 0)
      handlers.sort((a, b) => b.priority - a.priority);

    if (fireOnInit && this.payloads[actionType] !== undefined)
      handler(this.payloads[actionType]);
  }

  addSink(builder: SinkBuilder) {
    if (this.sinks[builder.namespace])
      return;

    this.sinks[builder.namespace] = builder;
    builder.getStore = () => this.store;

    const reducerKeys = Object.keys(builder.reducers);
    if (builder.stateProperty && reducerKeys.length > 0) {
      if (this.store) {
        const storeState = this.store.getState();
        const preloadedState = storeState && storeState[builder.namespace];
        if (preloadedState !== undefined)
          builder.setState(preloadedState);
      }

      const reducers = reducerKeys.reduce((accumulated, key) => (
        accumulated[builder.actions[key]] = builder.reducers[key], accumulated
      ), {});

      const reducer = combineReducer(builder.state, reducers);
      this.addReducer(builder.namespace, reducer);
    }

    // create reducer if there is state and reducers
    Object.keys(builder.effects).forEach(key =>
      this.addEffect(builder.actions[key], builder.effects[key])
    );

    // register subscribe
    Object.keys(builder.triggers).forEach(key => {
      const trigger = builder.triggers[key];
      this.addTrigger(trigger.actionType, trigger.handler, trigger.options);
    });
  }

  rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this.store!.replaceReducer(reducer);
  }
}
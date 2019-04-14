import { ReducersMapObject, Store, Reducer, Action } from 'redux';
import { PayloadHandler, TriggerOptions, TriggerHandler } from './typings';
import { SinkBuilder } from './SinkBuilder';
import { buildReducers } from './buildReducers';
import { combineReducer } from './combineReducer';
import { Sink } from './Sink';

export class SinkContainer {
  store?: Store;
  reducers: ReducersMapObject<any, any> = {};

  effectHandlers = new Map<string, PayloadHandler>();
  effectTasks: Array<Promise<any>> = [];

  triggerHandlers = new Map<string, Array<{ priority: number, handler: TriggerHandler }>>();
  stagedActions: { [key: string]: any } = {};

  sinks: { [key: string]: Sink } = {};

  runTriggerEvents(action: Action) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers) {
      const tasks = triggers.map(trigger => trigger.handler(action));
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

  addTrigger(actionType: string, handler: TriggerHandler, options?: TriggerOptions) {
    let handlers = this.triggerHandlers.get(actionType);
    if (!handlers) {
      this.triggerHandlers.set(actionType, handlers = []);
    }
    const priority = options && options.priority || 0;
    const fireOnInit = options && options.fireOnInit;

    handlers.push({ handler, priority });
    
    if (priority > 0)
      handlers.sort((a, b) => b.priority - a.priority);

    if (fireOnInit && this.stagedActions[actionType] !== undefined) {
      const action = this.stagedActions[actionType];
      handler(action);
    }
  }

  addSink(builder: SinkBuilder) {
    if (this.sinks[builder.namespace])
      return;

    const sink = builder.createSink();
    this.sinks[builder.namespace] = sink;

    sink.getStore = () => this.store;

    const reducerKeys = Object.keys(sink.reducers);
    if (sink.stateProperty) {
      if (this.store) {
        const storeState = this.store.getState();
        const preloadedState = storeState && storeState[sink.namespace];
        if (preloadedState !== undefined)
          sink.setState(preloadedState);
      }

      const reducers = reducerKeys.reduce((accumulated, key) => (
        accumulated[sink.actions[key]] = sink.reducers[key], accumulated
      ), {} as { [key: string]: any });

      const reducer = combineReducer(sink.state, reducers);
      this.addReducer(sink.namespace, reducer);
    }

    // create reducer if there is state and reducers
    Object.keys(sink.effects).forEach(key =>
      this.addEffect(sink.actions[key], sink.effects[key])
    );

    // register subscribe
    sink.triggers.forEach(trigger => {
      this.addTrigger(trigger.actionType, trigger.handler, trigger.options);
    });
  }

  rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this.store!.replaceReducer(reducer);
  }
}
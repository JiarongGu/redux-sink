import { ReducersMapObject, Store, Reducer, Action } from 'redux';
import { TriggerOptions, TriggerHandler, EffectHandler, Constructor } from './typings';
import { SinkBuilder } from './SinkBuilder';
import { buildReducers, combineReducer } from './utilities';
import { Sink } from './Sink';

export class SinkContainer {
  store?: Store;
  reducers: ReducersMapObject<any, any> = {};

  effectHandlers = new Map<string, EffectHandler>();
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

  sink<TSink>(sink: Constructor<TSink>) {
    return this.sinkPrototype(sink).instance as TSink;
  }

  sinkPrototype<TSink>(sink: Constructor<TSink>) {
    const builder = SinkBuilder.get(sink.prototype);

    if (!this.sinks[builder.namespace])
      this.addSink(builder);

    return this.sinks[builder.namespace];
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
    this.reducers[namespace] = reducer;

    // if store is already set, rebuild reducer
    if (this.store)
      this.rebuildReducer();
  }

  addEffect(action: string, handler: EffectHandler) {
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
    const sinkContainer = { 
      sink: this.sink.bind(this) 
    };
    
    const sink = builder.buildSink(() => this.store, sinkContainer);
    this.sinks[builder.namespace] = sink;

    const reducerKeys = Object.keys(sink.reducers);
    if (reducerKeys.length > 0) {
      if (this.store) {
        const storeState = this.store.getState();
        const preloadedState = storeState && storeState[sink.namespace];
        if (preloadedState !== undefined)
          sink.setState(preloadedState);
      }

      const reducer = reducerKeys.reduce((accumulated, key) => (
        accumulated[sink.actions[key]] = sink.reducers[key], accumulated
      ), {} as { [key: string]: any });

      this.addReducer(sink.namespace, combineReducer(sink.state, reducer));
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
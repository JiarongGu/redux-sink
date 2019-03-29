import { ReducersMapObject, Store, Reducer } from 'redux';
import { PayloadHandler, Action, Constructor } from './typings';
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

  async runTriggerEvents(action: Action) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers)
      await Promise.all(triggers.map(trigger => trigger.handler(action.payload)));
  }

  applyReduxSinkStore(store: Store) {
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

  addTrigger(action: string, handler: PayloadHandler, priority?: number) {
    let handlers = this.triggerHandlers.get(action);
    if (!handlers) {
      this.triggerHandlers.set(action, handlers = []);
    }
    handlers.push({ handler, priority: priority || 0 });
    handlers.sort((a, b) => b.priority - a.priority);

    if (this.payloads[action] !== undefined)
      handler(this.payloads[action]);
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

    // ensure tigger built
    Object.keys(builder.triggers).forEach(key => {
      const sink = builder.triggers[key].sink;
      if (sink) this.ensureSinkBuilt(sink);
    });

    // create reducer if there is state and reducers
    Object.keys(builder.effects).forEach(key =>
      this.addEffect(builder.actions[key], builder.effects[key])
    );

    // register subscribe
    Object.keys(builder.triggers).forEach(key => {
      const trigger = builder.triggers[key];
      this.addTrigger(trigger.action, trigger.handler, trigger.priority);
    });
  }

  ensureSinkBuilt(sink: Constructor) {
    const sinkBuilder = SinkBuilder.get(sink.prototype);
    if (!this.sinks[sinkBuilder.namespace]) new sink();
    return sinkBuilder;
  }

  rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this.store!.replaceReducer(reducer);
  }
}
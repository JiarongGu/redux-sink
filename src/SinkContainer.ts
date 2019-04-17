import { ReducersMapObject, Store, Action } from 'redux';
import { Constructor, StoreConfiguration, BuildSinkParams } from './typings';
import { SinkBuilder } from './SinkBuilder';
import { buildReducers, combineReducer, createSinkStore } from './utilities';
import { Sink } from './Sink';
import { TriggerService, EffectService } from './services';

export class SinkContainer {
  store?: Store;
  reducers: ReducersMapObject<any, any> = {};

  effectService = new EffectService();
  triggerService = new TriggerService();

  sinks: { [key: string]: Sink } = {};

  createStore<TState = any>(config?: StoreConfiguration<TState>) {
    const store = createSinkStore(this, config);
    this.store = store;

    const state = this.store.getState() || {};
    Object.keys(this.sinks).forEach(key => {
      const sinkState = state[key];
      if (sinkState !== undefined)
        this.sinks[key].setState(sinkState)
    });
    this.rebuildReducer();

    return store;
  }

  get effectTasks() {
    return this.effectService.effectTasks;
  }

  activeTrigger(action: Action) {
    return this.triggerService.activeTrigger(action);
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

  private addSink(builder: SinkBuilder) {
    // build sink with build params
    const buildParams: BuildSinkParams = {
      getStore: () => this.store,
      getSink: (sink) => this.sink(sink),
    };
    const sink = builder.buildSink(buildParams);

    // add sink to container
    this.sinks[builder.namespace] = sink;

    // create reducer if we got reducers
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

      this.reducers[sink.namespace] = combineReducer(sink.state, reducer);

      // if store is already set, rebuild reducer
      if (this.store)
        this.rebuildReducer();
    }

    // register effects
    Object.keys(sink.effects).forEach(key =>
      this.effectService.addEffect(sink.actions[key], sink.effects[key])
    );

    // register subscribe
    sink.triggers.forEach(trigger => {
      this.triggerService.addTrigger(trigger.actionType, trigger.handler, trigger.options);
    });
  }

  private rebuildReducer() {
    const reducer = buildReducers(this.reducers);
    this.store!.replaceReducer(reducer);
  }
}
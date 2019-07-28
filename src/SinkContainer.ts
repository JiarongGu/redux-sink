import { ReducersMapObject, Store } from 'redux';

import { EffectService, TriggerService } from './services';
import { Sink } from './Sink';
import { SinkBuilder } from './SinkBuilder';
import { BuildSinkParams, Constructor, SinkAction, StoreConfiguration } from './typings';
import { buildReducers, combineReducer, createSinkStore } from './utilities';

export class SinkContainer {
  public store?: Store;
  public reducers: ReducersMapObject<any, any> = {};

  public effectService = new EffectService();
  public triggerService = new TriggerService();

  public sinks: { [key: string]: Sink } = {};

  public createStore<TState = any>(config?: StoreConfiguration<TState>) {
    const store = createSinkStore(this, config);
    this.store = store;

    const state = this.store.getState() || {};
    Object.keys(this.sinks).forEach(key => {
      const sinkState = state[key];
      if (sinkState !== undefined) {
        this.sinks[key].setState(sinkState);
      }
    });
    this.rebuildReducer();

    return store;
  }

  get effectTasks() {
    return this.effectService.effectTasks;
  }

  public activeTrigger(action: SinkAction) {
    return this.triggerService.activeTrigger(action);
  }

  public sink<TSink>(sink: Constructor<TSink>) {
    return this.sinkPrototype(sink).instance as TSink;
  }

  public sinkPrototype<TSink>(sink: Constructor<TSink>) {
    const builder = SinkBuilder.get(sink.prototype);

    if (!this.sinks[builder.namespace]) {
      this.addSink(builder);
    }

    return this.sinks[builder.namespace];
  }

  private addSink(builder: SinkBuilder) {
    // build sink with build params
    const buildParams: BuildSinkParams = {
      getSink: (sinkConstructor: Constructor<any>) => this.sink(sinkConstructor),
      getStore: () => this.store
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
        if (preloadedState !== undefined) {
          sink.setState(preloadedState);
        }
      }

      const reducer = reducerKeys.reduce((accumulated, key) => (
        accumulated[sink.actions[key]] = sink.reducers[key], accumulated
      ), {} as { [key: string]: any });

      this.reducers[sink.namespace] = combineReducer(sink.state, reducer);

      // if store is already set, rebuild reducer
      if (this.store) {
        this.rebuildReducer();
      }
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

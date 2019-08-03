import { ReducersMapObject, Store } from 'redux';

import { EffectService, TriggerService } from './services';
import { Sink } from './Sink';
import { SinkBuilder } from './SinkBuilder';
import { Constructor, SinkAction, StoreConfiguration } from './typings';
import { buildReducer, combineReducers, configureStoreWithSink } from './utilities';

export class SinkContainer {
  public store?: Store;
  public reducers: ReducersMapObject<any, any> = {};

  public effectService = new EffectService();
  public triggerService = new TriggerService();

  public sinks: { [key: string]: Sink } = {};

  constructor() {
    this.getSink = this.getSink.bind(this);
    this.getStore = this.getStore.bind(this);
  }

  public createStore<TState = any>(config?: StoreConfiguration<TState>): Store<TState> {
    const store = configureStoreWithSink<TState>(this, config);
    this.store = store;

    const state = this.store.getState() || {};

    // update sink state from preloaded state
    Object.keys(this.sinks).forEach(key => {
      const sinkState = state[key];
      if (sinkState !== undefined) {
        this.sinks[key].setState(sinkState);
      }
    });

    // rebuild reducer combine with sink reducers
    this.rebuildReducer(this.store);
    return store;
  }

  public getEffectTasks(): Array<Promise<any>> {
    return this.effectService.effectTasks;
  }

  public activateTrigger(action: SinkAction): Promise<any> {
    return this.triggerService.activateTrigger(action);
  }

  public getStore(): Store | undefined {
    return this.store;
  }

  public getSink<T>(sink: Constructor<T>): T {
    return this.getSinkPrototype(sink).instance as T;
  }

  public getSinkPrototype<TSink>(sink: Constructor<TSink>): Sink {
    if (!sink || !sink.prototype) {
      throw new Error(`sink not found`);
    }

    const builder = SinkBuilder.get(sink.prototype);

    if (!builder.namespace) {
      throw new Error(`please use @sink decorator: ${sink.toString()}`);
    }

    if (!this.sinks[builder.namespace]) {
      this.addSink(builder);
    }

    return this.sinks[builder.namespace];
  }

  private addSink(builder: SinkBuilder) {
    // build sink with build params
    const sink = builder.buildSink({
      getSink: this.getSink as any,
      getStore: this.getStore
    });

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

      this.reducers[sink.namespace] = buildReducer(sink.state, reducer);

      // if store is already set, rebuild reducer
      if (this.store) {
        this.rebuildReducer(this.store);
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

  private rebuildReducer(store: Store) {
    store.replaceReducer(combineReducers(this.reducers));
  }
}

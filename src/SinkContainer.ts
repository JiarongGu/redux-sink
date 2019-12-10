import { Middleware, ReducersMapObject, Store } from 'redux';

import { EffectService, TriggerService } from './services';
import { Sink } from './Sink';
import { SinkBuilder } from './SinkBuilder';
import { Constructor, DefaultSinkConfiguration, SinkAction, SinkConfiguration } from './typings';
import { combineReducers, configureStore, createServiceMiddleware } from './utils';

const defaultSinkConfig: DefaultSinkConfiguration = {
  middlewares: [] as Array<Middleware>,
  reducers: {},
  useEffectTrace: false,
  useTrigger: false,
};

export class SinkContainer {
  public store?: Store;
  public reducers: ReducersMapObject<any, any> = {};

  public effectService: EffectService;
  public triggerService: TriggerService;

  public sinks: { [key: string]: Sink } = {};

  constructor() {
    this.getSink = this.getSink.bind(this);
    this.getStore = this.getStore.bind(this);

    this.triggerService = new TriggerService();
    this.effectService = new EffectService();
  }

  /**
   * Create store by sink configuration
   * @param {SinkConfiguration} config
   */
  public createStore<TState = any>(config?: SinkConfiguration<TState>): Store<TState> {
    // get config in used by combine default and user config
    const useConfig = Object.assign({}, defaultSinkConfig, config);
    const middlewares: Array<Middleware> = [];

    // configure trigger service
    if (useConfig.useTrigger) {
      middlewares.push(createServiceMiddleware(this.triggerService));
    }

    // configure effect service
    this.effectService.enableTrace = useConfig.useEffectTrace;
    middlewares.push(createServiceMiddleware(this.effectService));

    // create store, combine reducers with container reducer
    this.store = configureStore<TState>({
      devToolOptions: useConfig.devToolOptions,
      middlewares: middlewares.concat(useConfig.middlewares),
      preloadedState: useConfig.preloadedState,
      reducers: Object.assign({}, this.reducers, useConfig.reducers),
    });

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
    return this.store;
  }

  /**
   * invoke triggers by action
   * @param action sink action
   */
  public invokeTrigger(action: SinkAction): Promise<any> {
    return this.triggerService.invoke(action).value;
  }

  /**
   * invoke effect by action
   * @param action sink action
   */
  public invokeEffect(action: SinkAction): Promise<any> {
    return this.effectService.invoke(action).value;
  }

  /**
   * Get traced effect tasks
   * @returns {[Promise]} promise array
   */
  public getEffectTasks(): Array<Promise<any>> {
    return this.effectService.tasks;
  }

  /**
   * Get underlying redux store
   */
  public getStore(): Store | undefined {
    return this.store;
  }

  /**
   * Get sink instance by sink class
   * @param sink Sink class
   * @returns Sink instance
   */
  public getSink<T>(sink: Constructor<T>): T {
    return this.getSinkPrototype(sink).instance as T;
  }

  /**
   * Get sink prototype by sink class, will build sink if its not built yet in this container
   * @param sink Sink class
   * @returns Sink prototype, contains sink builder and sink configurations
   */
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

      // update reducers in container
      if (sink.reducer) {
        this.reducers[sink.namespace] = sink.reducer;
      }

      // if store is already set, rebuild reducer
      if (this.store) {
        this.rebuildReducer(this.store);
      }
    }

    // register effects
    Object.keys(sink.effects).forEach(key =>
      this.effectService!.addEffect(sink.actions[key], sink.effects[key])
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

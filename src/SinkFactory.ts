import { StoreConfiguration, Constructor } from './typings';
import { configureStore, createEffectMiddleware, createTriggerMiddleware } from './utilities';
import { SinkContainer } from './SinkContainer';
import { Action } from 'redux';

export class SinkFactoryClass {
  container = new SinkContainer();

  createStore<TState = any>(config?: StoreConfiguration<TState>) {
    let middlewares = [
      createTriggerMiddleware(this.container),
      createEffectMiddleware(this.container)
    ];

    if (config && config.middlewares)
      middlewares = middlewares.concat(config.middlewares);

    if (config && config.reducers)
      Object.assign(this.container.reducers, config.reducers);

    const store = configureStore({ ...config, middlewares });
    
    this.container.setStore(store);
    return store;
  }

  sink<TSink>(sink: Constructor<TSink>) {
    return this.container.sink(sink);
  }

  sinkPrototype<TSink>(sink: Constructor<TSink>) {
    return this.container.sinkPrototype(sink);
  }

  get effectTasks() {
    return this.container.effectTasks;
  }

  runTriggerEvents(action: Action) {
    return this.container.runTriggerEvents(action);
  }
}

/**
 * default sink container for create store and bind sinks
 */
export const SinkFactory = new SinkFactoryClass();
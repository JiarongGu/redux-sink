import { StoreConfiguration, Constructor } from './typings';
import { configureStore } from './configureStore';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { createTriggerMiddleware } from './createTriggerMiddleware';
import { SinkBuilder } from './SinkBuilder';
import { SinkContainer } from './SinkContainer';
import { Action } from 'redux';

/**
 * default sink container for create store and bind sinks
 */
export class SinkFactory {
  static container = new SinkContainer();

  static createStore<TState = any>(config?: StoreConfiguration<TState>) {
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

  static get<TSink>(sink: Constructor<TSink>) {
    return this.getSink(sink).instance as TSink;
  }

  static getSink(sink: Constructor) {
    const builder = SinkBuilder.get(sink.prototype);
    this.container.addSink(builder);
    return this.container.sinks[builder.namespace];
  }

  static get effectTasks() {
    return this.container.effectTasks;
  }

  static runTriggerEvents(action: Action) {
    return this.container.runTriggerEvents(action);
  }
}
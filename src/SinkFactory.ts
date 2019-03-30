import { StoreConfiguration, Action, Constructor } from './typings';
import { configureStore } from './configureStore';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { createTriggerMiddleware } from './createTriggerMiddleware';
import { SinkBuilder } from './SinkBuilder';
import { SinkContainer } from './SinkContainer';

export class SinkFactory {
  static container = new SinkContainer();

  static createStore<TState = any>(config?: StoreConfiguration<TState>) {
    let middlewares = [
      createTriggerMiddleware(this.container),
      createEffectMiddleware(this.container)
    ];

    if (config && config.middlewares)
      middlewares = middlewares.concat(config.middlewares);

    const store = configureStore({ ...config, middlewares });
    this.container.setStore(store);
    return store;
  }

  static addSink(builder: SinkBuilder) {
    this.container.addSink(builder);
  }

  static ensureSinkBuilt(sink: Constructor) {
    const sinkBuilder = SinkBuilder.get(sink.prototype);
    if (!this.container.sinks[sinkBuilder.namespace]) new sink();
    return sinkBuilder;
  }

  static async runTriggerEvents(action: Action) {
    return this.container.runTriggerEvents(action);
  }
}
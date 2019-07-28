import { SinkContainer } from '../SinkContainer';
import { StoreConfiguration } from '../typings';
import { configureStore } from './configureStore';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { createTriggerMiddleware } from './createTriggerMiddleware';

export function createSinkStore<TState = any>(container: SinkContainer, config?: StoreConfiguration<TState>) {
  let middlewares = [
    createTriggerMiddleware(container.triggerService),
    createEffectMiddleware(container.effectService)
  ];

  if (config && config.middlewares) {
    middlewares = middlewares.concat(config.middlewares);
  }

  if (config && config.reducers) {
    Object.assign(container.reducers, config.reducers);
  }

  const store = configureStore({ ...config, middlewares });
  return store;
}

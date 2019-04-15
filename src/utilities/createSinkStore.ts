import { StoreConfiguration } from '../typings';
import { createTriggerMiddleware } from './createTriggerMiddleware';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { SinkContainer } from '../SinkContainer';
import { configureStore } from './configureStore';

export function createSinkStore<TState = any>(container: SinkContainer, config?: StoreConfiguration<TState>) {
  let middlewares = [
    createTriggerMiddleware(container.triggerService),
    createEffectMiddleware(container.effectService)
  ];

  if (config && config.middlewares)
    middlewares = middlewares.concat(config.middlewares);

  if (config && config.reducers)
    Object.assign(container.reducers, config.reducers);

  const store = configureStore({ ...config, middlewares });
  return store;
}
import { SinkContainer } from '../SinkContainer';
import { StoreConfiguration } from '../typings';
import { configureStore } from './configureStore';
import { createEffectMiddleware } from './createEffectsMiddleware';
import { createTriggerMiddleware } from './createTriggerMiddleware';

const defaultConfig = {
  effectTrace: false,
  middlewares: [],
  reducers: {}
};

export function configureStoreWithSink<TState = any>(container: SinkContainer, config?: StoreConfiguration<TState>) {
  const useConfig = Object.assign({}, defaultConfig, config);

  const middlewares = [
    createTriggerMiddleware(container.triggerService),
    createEffectMiddleware(container.effectService, useConfig.effectTrace),
    ...useConfig.middlewares
  ];

  const reducers = Object.assign({}, container.reducers, useConfig.reducers);

  const store = configureStore({
    devToolOptions: useConfig.devToolOptions,
    effectTrace: useConfig.effectTrace,
    middlewares,
    preloadedState: useConfig.preloadedState,
    reducers,
  });
  return store;
}

import { Middleware } from 'redux';
import { SinkContainer } from '../SinkContainer';
import { StoreConfiguration } from '../typings';
import { configureStore } from './configureStore';
import { createServiceMiddleware } from './createServiceMiddleware';

const defaultConfig = {
  effectTrace: false,
  middlewares: [] as Array<Middleware>,
  reducers: {},
  useTrigger: true
};

export function configureStoreWithSink<TState = any>(container: SinkContainer, config?: StoreConfiguration<TState>) {
  // get config in used by combine default and user config
  const useConfig = Object.assign({}, defaultConfig, config);

  // config middlewares
  const middlewares: Array<Middleware> = [];
  if (useConfig.useTrigger) {
    // use trigger middleware only when useTrigger set to true in config
    middlewares.push(createServiceMiddleware(container.triggerService));
  }

  // config effect service;
  container.effectService.effectTrace = useConfig.effectTrace;

  middlewares.push(
    createServiceMiddleware(container.effectService),
    ...useConfig.middlewares
  );

  // combine reducers with container reducer
  const reducers = Object.assign({}, container.reducers, useConfig.reducers);

  // set middlewares and reducers
  useConfig.middlewares = middlewares;
  useConfig.reducers = reducers;

  const store = configureStore<TState>(useConfig);

  return store;
}

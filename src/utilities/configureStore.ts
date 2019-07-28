import { applyMiddleware, compose, createStore, Middleware } from 'redux';
import { StoreConfiguration } from '../typings';
import { buildReducers } from './buildReducers';

export function configureStore<TState = any>(config?: StoreConfiguration<TState>) {
  const preloadedState = config && config.preloadedState;
  let reducers: { [key: string]: any } = {};
  let middlewares: Array<Middleware> = [];
  let finalCompose = compose;

  if (config) {
    reducers = config.reducers || [];
    middlewares = config.middlewares || [];

    if (config.devToolOptions && !config.devToolOptions.disabled) {
      const devToolCompose = config.devToolOptions.devToolCompose;

      if (devToolCompose) {
        finalCompose = devToolCompose(config.devToolOptions);
      }
    }
  }

  const combinedMiddleware = applyMiddleware(...middlewares);
  const composedMiddlewares = finalCompose(combinedMiddleware);
  const combinedReducer = buildReducers(reducers);

  if (preloadedState === undefined) {
    return createStore(combinedReducer as any, composedMiddlewares);
  }
  return createStore(combinedReducer as any, preloadedState, composedMiddlewares);
}

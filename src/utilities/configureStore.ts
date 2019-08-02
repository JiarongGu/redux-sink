import { applyMiddleware, compose, createStore, Middleware } from 'redux';
import { StoreConfiguration } from '../typings';
import { combineReducers } from './combineReducers';

export function configureStore<TState = any>(config: StoreConfiguration<TState>) {
  const preloadedState = config.preloadedState;
  const reducers: { [key: string]: any } = config.reducers!;
  const middlewares: Array<Middleware> = config.middlewares!;
  let finalCompose = compose;

  if (config.devToolOptions && !config.devToolOptions.disabled) {
    const devToolCompose = config.devToolOptions.devToolCompose;

    if (devToolCompose) {
      finalCompose = devToolCompose(config.devToolOptions);
    }
  }

  const combinedMiddleware = applyMiddleware(...middlewares);
  const composedMiddlewares = finalCompose(combinedMiddleware);
  const combinedReducer = combineReducers(reducers);

  if (preloadedState === undefined) {
    return createStore(combinedReducer as any, composedMiddlewares);
  }
  return createStore(combinedReducer as any, preloadedState, composedMiddlewares);
}

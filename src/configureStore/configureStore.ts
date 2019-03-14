import { createStore, applyMiddleware, compose } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { applyReduxSinkStore, buildReducers } from '../redux-registry';
import { triggerMiddleware, effectMiddleware } from '../middlewares';
import { StoreConfiguration } from '../types';

export function configureSinkStore<TState = any>(config?: StoreConfiguration<TState>) {
  let middlewares = [triggerMiddleware, effectMiddleware];

  if (config && config.middlewares)
    middlewares = middlewares.concat(config.middlewares);

  const store = configureStore({ ...config, middlewares });

  applyReduxSinkStore(store);

  return store;
}

export function configureStore<TState = any>(config?: StoreConfiguration<TState>) {
  const reducers = config && config.reducers || [];
  const middlewares = config && config.middlewares || [];
  const preloadedState = config && config.preloadedState;
  const devTool = config && config.devTool || false;

  const combinedMiddleware = applyMiddleware(...middlewares);
  const composedMiddlewares = devTool ? composeWithDevTools(combinedMiddleware) : compose(combinedMiddleware);
  const combinedReducer = buildReducers(reducers);

  if (preloadedState == undefined)
    return createStore(combinedReducer as any, composedMiddlewares);
  return createStore(combinedReducer as any, preloadedState, composedMiddlewares);
}


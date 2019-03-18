import { createStore, applyMiddleware, compose, Middleware } from 'redux';
import { triggerMiddleware, effectMiddleware } from './middlewares';
import { StoreConfiguration } from './typings';
import { SinkFactory } from './SinkFactory';
import { buildReducers } from './buildReducers';

export function configureSinkStore<TState = any>(config?: StoreConfiguration<TState>) {
  let middlewares = [triggerMiddleware, effectMiddleware];

  if (config && config.middlewares)
    middlewares = middlewares.concat(config.middlewares);

  const store = configureStore({ ...config, middlewares });

  SinkFactory.applyReduxSinkStore(store);
  return store;
}

export function configureStore<TState = any>(config?: StoreConfiguration<TState>) {
  let preloadedState = config && config.preloadedState;
  let reducers: { [key: string]: any } = {};
  let middlewares: Array<Middleware> = [];
  let finalCompose = compose;

  if (config) {
    reducers = config.reducers || [];
    middlewares = config.middlewares || [];

    if (config.devtoolOptions && !config.devtoolOptions.disabled) {
      const { disabled, devToolCompose, ...options } =  config.devtoolOptions;
      finalCompose = config.devtoolOptions.devToolCompose(config.devtoolOptions); 
    }
  }

  const combinedMiddleware = applyMiddleware(...middlewares);
  const composedMiddlewares = finalCompose(combinedMiddleware);
  const combinedReducer = buildReducers(reducers);

  if (preloadedState == undefined)
    return createStore(combinedReducer as any, composedMiddlewares);
  return createStore(combinedReducer as any, preloadedState, composedMiddlewares);
}


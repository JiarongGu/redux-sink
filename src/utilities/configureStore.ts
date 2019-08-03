import { applyMiddleware, compose, createStore, Middleware, Store } from 'redux';
import { StoreConfiguration } from '../typings';
import { combineReducers } from './combineReducers';

export function configureStore<TState = any>(config: StoreConfiguration<TState>): Store<TState> {
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

  // preloaded state must be an object
  const store: any = preloadedState ?
    createStore(combinedReducer as any, preloadedState, composedMiddlewares) :
    createStore(combinedReducer as any, composedMiddlewares);

  return store as Store<TState>;
}

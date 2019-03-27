import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { Action, ISinkFactory } from './typings';

export function createTriggerMiddleware(factory: ISinkFactory) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: Action) => {
    if (factory.reloaders[action.type] !== undefined) {
      factory.reloaders[action.type] = action.payload;
    }
    factory.runTriggerEvents(action);
    return next(action);
  };
}
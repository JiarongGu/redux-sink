import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { Action } from './typings';
import { SinkFactory } from './SinkFactory';

export function createTriggerMiddleware(factory: SinkFactory) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: Action) => {
    if (factory.reloaders[action.type] !== undefined) {
      factory.reloaders[action.type] = action.payload;
    }
    factory.runTriggerEvents(action);
    return next(action);
  };
}
import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { Action } from './typings';
import { SinkContainer } from './SinkContainer';

export function createTriggerMiddleware(container: SinkContainer) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: Action) => {
    container.payloads[action.type] = action.payload;
    container.runTriggerEvents(action);
    return next(action);
  };
}
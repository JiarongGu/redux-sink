import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { SinkContainer } from './SinkContainer';

export function createTriggerMiddleware(container: SinkContainer) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: any) => {
    if(action.type) {
      container.stagedActions[action.type] = action;
      container.runTriggerEvents(action);
    }
    return next(action);
  };
}
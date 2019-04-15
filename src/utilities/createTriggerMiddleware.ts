import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { TriggerService } from '../services';

export function createTriggerMiddleware(service: TriggerService) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: any) => {
    if(action.type) {
      service.stagedActions[action.type] = action;
      service.activeTrigger(action);
    }
    return next(action);
  };
}
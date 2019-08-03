import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';

import { TriggerService } from '../services';
import { SinkAction } from '../typings';

export function createTriggerMiddleware(service: TriggerService) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: SinkAction) => {
    service.activateTrigger(action);
    return next(action);
  };
}

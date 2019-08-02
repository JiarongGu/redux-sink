import { Dispatch, MiddlewareAPI } from 'redux';

import { EffectService } from '../services/EffectService';
import { SinkAction } from '../typings';

export function createEffectMiddleware(service: EffectService, effectTrace: boolean) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<SinkAction>) => (action: any) => {
    if (action.type && action.payload) {
      const handler = service.effectHandlers.get(action.type);

      if (handler) {
        const task = handler(action.payload);

        // push promise task to queue
        if (effectTrace && task && task.then) {
          service.addEffectTask(task);
        }
        return task;
      }
    }
    return next(action);
  };
}

import { MiddlewareAPI, Dispatch, Action } from 'redux';
import { EffectService } from 'services/EffectService';

export function createEffectMiddleware(service: EffectService) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<Action>) => (action: any) => {
    if(action.type && action.payload) { 
      const handler = service.effectHandlers.get(action.type);

      if (handler) {
        const task = handler(action.payload);

        // push promise task to queue
        if (task && task.then) {
          service.addEffectTask(task);
        }
        return task;
      }
    }
    return next(action);
  };
}
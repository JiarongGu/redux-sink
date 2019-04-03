import { MiddlewareAPI, Dispatch, Action } from 'redux';
import { SinkContainer } from './SinkContainer';

export function createEffectMiddleware(container: SinkContainer) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<Action>) => (action: any) => {
    if(action.type && action.payload) { 
      const handler = container.effectHandlers.get(action.type);

      if (handler) {
        const task = handler(action.payload);

        // push promise task to queue
        if (task && task.then) {
          container.effectTasks.push(task.then((response: any) => {
            container.effectTasks.splice(container.effectTasks.indexOf(task), 1);
            return response;
          }));
        }
        return task;
      }
    }
    return next(action);
  };
}
import { MiddlewareAPI, Dispatch } from 'redux';
import { Action, ISinkFactory } from './typings';

export function createEffectMiddleware(factory: ISinkFactory) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<Action>) => (action: Action) => {
    const handler = factory.effectHandlers.get(action.type);
  
    if (handler) {
      const task = handler(action.payload);
  
      // push promise task to queue
      if (task && task.then) {
        factory.effectTasks.push(task.then((response: any) => {
          factory.effectTasks.splice(factory.effectTasks.indexOf(task), 1);
          return response;
        }));
      }
      return task;
    }
  
    return next(action);
  };
}
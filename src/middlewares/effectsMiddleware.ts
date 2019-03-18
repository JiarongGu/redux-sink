import { MiddlewareAPI, Dispatch } from 'redux';
import { Action, PayloadHandler } from '../typings';

const handlers = new Map<string, PayloadHandler>();
const effectTasks: Array<Promise<any>> = [];

export const effectMiddleware: any = (store: MiddlewareAPI<any>) => (next: Dispatch<Action>) => (action: Action) => {
  const handler = handlers.get(action.type);

  if (handler) {
    const task = handler(action.payload);

    // push promise task to queue
    if (task && task.then) {
      effectTasks.push(task.then((response: any) => {
        effectTasks.splice(effectTasks.indexOf(task), 1);
        return response;
      }));
    }
    return task;
  }

  return next(action);
};

export function registerEffect(action: string, event: PayloadHandler) {
  handlers.set(action, event);
}

export function getEffectTasks() {
  return effectTasks;
}
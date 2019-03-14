import { MiddlewareAPI, Dispatch } from 'redux';
import { Action, EffectEvent, EffectFunction } from '../types';

const effects = new Map<string, EffectFunction>();
const effectTasks: Array<Promise<any>> = [];

export const effectMiddleware: any = (store: MiddlewareAPI<any>) => (next: Dispatch<Action>) => (action: Action) => {
  const effect = effects.get(action.type);

  if (effect) {
    const task = effect(store, action.payload);

    // push promise task to queue
    if (task && task.then) {
      effectTasks.push(task.then((res) => {
        effectTasks.splice(effectTasks.indexOf(task), 1);
        return res;
      }));
    }
    return task;
  }

  return next(action);
};

export function registerEffect(event: EffectEvent) {
  effects.set(event.action.toString(), event.effect);
}

export function getEffectTasks() {
  return effectTasks;
}
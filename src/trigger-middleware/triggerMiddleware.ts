import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { TriggerEvent, Function } from '../types';

const triggerEvents = new Map<string, Array<Function>>();

export const triggerMiddleware = (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
  runTriggerEvents(action);
  return next(action);
};

// process location task, return task array
export async function runTriggerEvents(action: AnyAction) {
  const triggers = triggerEvents.get(action.type);
  if (triggers)
    await Promise.all(triggers.map(handler => handler(action.payload)));
}

// add new location event and run location tasks after
export function registerTrigger(handler: TriggerEvent) {
  const action = handler.action;
  const process = handler.process;
  let triggers = triggerEvents.get[action];

  if (!triggers) {
    triggers = [];
    triggerEvents.set(action, triggers);
  }
  triggers.push(process);
  triggers.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
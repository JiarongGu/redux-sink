import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { Function, Action, TriggerEvent } from '../typings';

const triggerEvents = new Map<string, Array<{ priority: number, process: Function }>>();
const reloaders: { [key: string]: any } = {};

export const triggerMiddleware = (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: Action) => {
  if (reloaders[action.type] !== undefined) {
    reloaders[action.type] = action.payload;
  }
  runTriggerEvents(action);
  return next(action);
};

// process location task, return task array
export async function runTriggerEvents(action: Action) {
  const triggers = triggerEvents.get(action.type);
  if (triggers)
    await Promise.all(triggers.map(trigger => trigger.process(action.payload)));
}

// add new location event and run location tasks after
export function registerTrigger(trigger: TriggerEvent) {
  const action = trigger.action;
  const process = trigger.process;

  let triggers = triggerEvents.get(action);

  if (!triggers) {
    triggerEvents.set(action, triggers = []);
  }

  triggers.push({ process, priority: trigger.priority || 0 });
  triggers.sort((a, b) => b.priority - a.priority);

  if (reloaders[action] !== undefined) {
    process(reloaders[action]);
  }
}

export function registerReloader(action: string, payload: any = null) {
  reloaders[action] = payload;
}
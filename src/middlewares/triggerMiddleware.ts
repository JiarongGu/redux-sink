import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { TriggerEvent, Function, Action } from '../types';

const triggerEvents = new Map<string, Array<Function>>();
const retriggerActions: { [key: string]: Action | null } = {};

export const triggerMiddleware = (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: Action) => {
  if (retriggerActions[action.type] != undefined) {
    retriggerActions[action.type] = action;
  }
  runTriggerEvents(action);
  return next(action);
};

// process location task, return task array
export async function runTriggerEvents(action: Action) {
  const triggers = triggerEvents.get(action.type);
  const payload = Array.isArray(action.payload) ? action.payload : [ action.payload ];
  if (triggers)
    await Promise.all(triggers.map(handler => handler(...payload)));
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

  if (retriggerActions[action] !== undefined) {
    process(retriggerActions[action]);
  }
}

export function applyRetriggerAction(action: string, value: any = null) {
  retriggerActions[action] = value;
}
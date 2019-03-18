import { MiddlewareAPI, Dispatch, AnyAction } from 'redux';
import { Action } from './typings';
import { SinkFactory } from './SinkFactory';

export const triggerMiddleware = (store: MiddlewareAPI<any>) => (next: Dispatch<AnyAction>) => (action: Action) => {
  if (SinkFactory.reloaders[action.type] !== undefined) {
    SinkFactory.reloaders[action.type] = action.payload;
  }
  runTriggerEvents(action);
  return next(action);
};

export async function runTriggerEvents(action: Action) {
  const triggers = SinkFactory.triggerHandlers.get(action.type);
  if (triggers)
    await Promise.all(triggers.map(trigger => trigger.handler(action.payload)));
}
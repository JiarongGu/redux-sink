import { EffectEvent, EffectFunction } from '../types';
import { createAction } from './createAction';


/**
 * package effect handler with action
 * @param func effect func that process for async tasks, takes store and payload
 * @param type action type, default by unique id
 */
export function createEffectEvent(func: EffectFunction, type?: string) {
  const createdAction = createAction(undefined, type);
  return {
    action: createdAction,
    effect: func
  } as EffectEvent;
}
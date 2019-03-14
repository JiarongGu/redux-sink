import { ReducerEvent, ReducerFunction, ActionFunction } from '../types';
import { createAction } from './createAction';
import { createReducer } from './createReducer';

/**
 * create reducer event with contains reducer and action used by redux registration
 * @param reducer reducer function take state and payload generate new state
 * @param action action function formats action to payload
 * @param type action type, will generate by unqiue id if not supplied
 */
export function createReducerEvent<TState = any, TPayload = any>(reducer: ReducerFunction<TState, TPayload>, action?: ActionFunction, type?: string) {
  const createdAction = createAction(action, type);
  return {
    action: createdAction,
    reducer: { [createdAction.toString()]: createReducer(reducer) }
  } as ReducerEvent<TState, TPayload>;
}
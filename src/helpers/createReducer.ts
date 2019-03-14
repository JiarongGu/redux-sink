import { ReducerFunction, Action } from '../types';

/**
 * create reducer based on reducer function
 * @param func reducer function process take current state and payload
 */
export function createReducer<TState, TPayload>(func: ReducerFunction<TState, TPayload>)
{
  return function(state: TState, action: Action<TPayload>) {
    return func(state, action.payload)
  }
}
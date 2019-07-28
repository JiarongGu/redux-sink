import { SinkDispatch } from '../typings';

export function mergeDispatchState<T>(dispatches: { [key: string]: SinkDispatch }, state: any) {
  return { ...dispatches, ...state } as T;
}

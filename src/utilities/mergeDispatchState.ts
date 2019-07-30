import { SinkDispatch } from '../typings';
import { reduceKeys } from './reduceKeys';

export function mergeDispatchState<T>(dispatches: { [key: string]: SinkDispatch }, state: any) {
  const merged = Object.assign({}, dispatches);

  if (state) {
    const defined = reduceKeys(Object.keys(state), (key) => {
      return {
        get: () => state[key],
        set: (value: any) => dispatches[key](value),
      };
    });
    Object.defineProperties(merged, defined);
  }
  return merged as any as T;
}

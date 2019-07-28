import { SinkDispatch } from '../typings';
import { reduceKeys } from './reduceKeys';

export function mergeDispatchState<T>(dispatches: { [key: string]: SinkDispatch }, state: any) {
  const defined = reduceKeys(Object.keys(state), (key) => {
    return {
      get: () => state[key],
      set: (value: any) => dispatches[key](value),
    };
  });
  const merged = Object.assign({}, dispatches);
  Object.defineProperties(merged, defined);

  return merged as any as T;
}

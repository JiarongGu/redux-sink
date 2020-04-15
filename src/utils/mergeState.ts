import { SinkDispatch } from '../typings';
import { reduceKeys } from './reduceKeys';

export function mergeState<T>(storeState: any, sinkState: any, dispatches: { [key: string]: SinkDispatch }) {
  const merged = Object.assign({}, dispatches);
  const defineProperties = reduceKeys(Object.keys(sinkState), (key) => {
    let state = storeState && storeState[key];
    if (state === undefined) {
      state = sinkState[key];
    }
    return {
      get: () => state,
      set: (value: any) => dispatches[key](value),
    };
  });

  Object.defineProperties(merged, defineProperties);
  return merged as any as T;
}

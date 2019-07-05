import { ReduceHandler } from '../typings';

export function combineReducer(preloadedState: any, reducers: { [key: string]: ReduceHandler }) {
  return function (state: any, action: any) {
    if (action && action.type) {
      const reducer = reducers[action.type];
      if (reducer)
        return reducer(state, action.payload);
    }
    return state === undefined ? preloadedState : state;
  }
}
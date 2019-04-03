import { PayloadHandler } from './typings';

export function combineReducer(preloadedState: any, reducers: { [key: string]: PayloadHandler }) {
  return function (state: any, action: any) {
    if (action && action.type && action.payload) {
      const reducer = reducers[action.type];
      if (reducer)
        return reducer(action.payload);
    }
    return state === undefined ? preloadedState : state;
  }
}
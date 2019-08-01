import { Reducer } from 'redux';
import { ReducerHandlerMap, SinkAction } from '../typings';

export function combineReducer<S = any>(preloadedState: S, reducers: ReducerHandlerMap): Reducer<S, SinkAction> {
  return (state: any, action: SinkAction) => {
    if (action && action.type) {
      const reducer = reducers[action.type];
      if (reducer) {
        return reducer(state, action.payload);
      }
    }
    return state === undefined ? preloadedState : state;
  };
}

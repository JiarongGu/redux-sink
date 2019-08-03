import { Reducer } from 'redux';
import { ReducerHandlerMap, SinkAction } from '../typings';

export function buildReducer<TState = any>(
  preloadedState: TState, reducers: ReducerHandlerMap
): Reducer<TState, SinkAction> {
  return (state = preloadedState, action: SinkAction) => {
    if (action && action.type) {
      const reducer = reducers[action.type];
      if (reducer) {
        // if we found matched reducer
        return reducer(state, action.payload);
      }
    }
    return state;
  };
}

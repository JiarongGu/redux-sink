import { Action, AnyAction, combineReducers, Reducer, ReducersMapObject } from 'redux';

export function buildReducers<S = any>(reducers: ReducersMapObject<S>): Reducer<S>;
export function buildReducers<S = any, A extends Action = AnyAction>(reducers: ReducersMapObject<S, A>): Reducer<S, A> {
  if (Object.keys(reducers).length === 0) {
    return (state: any) => state;
  }
  return combineReducers(reducers);
}

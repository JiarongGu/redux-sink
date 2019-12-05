import { Action, AnyAction, combineReducers as _combineReducers, Reducer, ReducersMapObject } from 'redux';

export function combineReducers<S = any>(reducers: ReducersMapObject<S>): Reducer<S>;
export function combineReducers<S = any, A extends Action = AnyAction>(
  reducers: ReducersMapObject<S, A>
): Reducer<S, A> {
  if (Object.keys(reducers).length === 0) {
    return (state: any) => state;
  }
  return _combineReducers(reducers);
}

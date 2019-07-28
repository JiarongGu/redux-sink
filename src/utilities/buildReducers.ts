import { combineReducers, ReducersMapObject } from 'redux';

export function buildReducers(reducers: ReducersMapObject<any, any>) {
  if (Object.keys(reducers).length === 0) {
    return (state: any) => state;
  }
  return combineReducers(reducers);
}

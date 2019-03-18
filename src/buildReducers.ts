import { ReducersMapObject, combineReducers } from "redux";

export function buildReducers(reducers: ReducersMapObject<any, any>) {
  if (Object.keys(reducers).length === 0) {
    return (state) => state;
  }
  return combineReducers(reducers);
}
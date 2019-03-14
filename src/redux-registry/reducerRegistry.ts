import { ReducersMapObject, Store } from 'redux';
import { DynamicReducerMap } from '../types';
import { buildReducers } from './buildReducers';

const dynamicReducers: ReducersMapObject<any, any> = {};
const stateUpdaters: Array<(state: any) => void> = [];
let staticStore: Store;
let staticReducers: ReducersMapObject<any, any> = {};

export function addDynamicReducer(...reducerMaps: Array<DynamicReducerMap>) {
  reducerMaps.forEach(reducerMap => {
    const { namespace, reducer, serviceStateUpdater } = reducerMap;
    if (!dynamicReducers[namespace]) {
      dynamicReducers[namespace] = reducer;
      if (serviceStateUpdater) {
        const stateUpdater = (state) => serviceStateUpdater(state && state[namespace]);
        stateUpdaters.push(stateUpdater);
      }
    }
  });

  if (staticStore)
    updateReducers(staticStore, { ...staticReducers, ...dynamicReducers });
}

/**
 * apply store to sink
 * @param store configured store
 */
export function applyReduxSinkStore(store: Store) {
  staticStore = store;
  if (!staticStore)
    return;

  const state = store.getState();

  if (state) {
    // update existing service state
    stateUpdaters.forEach(update => update(state));
  }

  updateReducers(staticStore, { ...staticReducers, ...dynamicReducers });
}

function updateReducers(store: Store, reducers: ReducersMapObject<any, any>) {
  const reducer = buildReducers(reducers);
  if (reducer)
    store.replaceReducer(reducer);
}


export function getCurrentStore() {
  return staticStore;
}
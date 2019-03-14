import { addDynamicReducer } from './reducerRegistry';
import { ReducerRegistration, Reducer, ReducerEvent, Action } from '../types';

function combineReducerEvents<TState>(initalState: TState, ...events: Array<ReducerEvent<TState, any>>)
{
  const reducers = Object.assign({}, ...events.map(x => x.reducer));
  const combinedReducer: Reducer<TState, any>  = function(state: TState, action: Action) {
    const reducer = reducers[action.type];
    if (reducer)
      return reducer(state, action);
    return initalState;
  }

  return combinedReducer;
}

export function registerReducer<TState>(registration: ReducerRegistration<TState>) {
  var combinedReducer = combineReducerEvents(registration.initalState, ...registration.reducerEvents);
  
  addDynamicReducer({
    namespace: registration.namespace,
    reducer: combinedReducer,
    serviceStateUpdater: registration.serviceStateUpdater
  });
}
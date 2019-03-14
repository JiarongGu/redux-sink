import { createReducerEvent } from '../helpers';
import { getSinkBuilder } from '../sink-builder';

export function reducer(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = getSinkBuilder(target);

  if (!sinkBuilder.built) {
    // build reducer event
    const reducer = descriptor.value.bind(target);
    const reducerFunction = (state: any, args: Array<any>) => {
      const newState = reducer(...args);
      target[sinkBuilder.stateProperty!] = newState;
      return newState;
    };

    // create reducer event
    const reducerEvent = createReducerEvent<Array<any>>(reducerFunction);
    sinkBuilder.reducers.push(reducerEvent);
    sinkBuilder.actions[name] = reducerEvent.action.toString();

    // build dispatch action, using prototype's dispatch method
    const dispatchAction = (...args: Array<any>) => sinkBuilder.dispatch(reducerEvent.action(args));
    sinkBuilder.dispatches[name] = dispatchAction;
  }

  descriptor.value = sinkBuilder.dispatches[name];
  return descriptor;
}
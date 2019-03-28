import { SinkBuilder } from '../SinkBuilder';

/**
 * override function to reducer dispatch function
 * @param target prototype
 * @param name name of reducer
 * @param descriptor function to handle state update
 */
export function reducer(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = SinkBuilder.get(target);

  const reducer = descriptor.value.bind(target);
  
  sinkBuilder.reducers[name] = (args: Array<any>) => {
    const newState = reducer(...args);
    target[sinkBuilder.stateProperty!] = newState;
    return newState;
  };
  
  descriptor.value = function() {
    return sinkBuilder.dispatch(name)(Array.from(arguments)); 
  };
}
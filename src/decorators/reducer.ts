import { SinkBuilder } from '../SinkBuilder';

/**
 * override function to reducer dispatch function, 
 * the `action.type` will be `{namespace}/{reducer name}`, 
 * all parameters it take will be transform into `action.payload`
 * @param target prototype
 * @param name name of reducer
 * @param descriptor function to handle state update
 */
export function reducer(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = SinkBuilder.get(target);
  sinkBuilder.reducers[name] = descriptor.value;
}
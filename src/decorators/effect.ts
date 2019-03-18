import { SinkBuilder } from '../SinkBuilder';

/**
 * override function to effect dispatch function
 * @param target prototype
 * @param name name of effect
 * @param descriptor function to handle effect
 */
export function effect(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = SinkBuilder.get(target);
  const handler = descriptor.value.bind(target);
  
  sinkBuilder.effects[name] =  (payload: any) => handler(...payload);
  descriptor.value = (...args: Array<any>) => sinkBuilder.dispatch(name)(args);
}
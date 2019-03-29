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

  sinkBuilder.effects[name] = (payload: Array<any>) => handler(...payload);
  descriptor.value = function () {
    return sinkBuilder.dispatch(name)(Array.from(arguments));
  };
}
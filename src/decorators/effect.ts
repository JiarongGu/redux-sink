import { SinkBuilder } from '../SinkBuilder';

/**
 * override function to effect dispatch function, 
 * the `action.type` will be `{namespace}/{effect name}`, 
 * all parameters it take will be transform into `action.payload`
 * @param {Object} [target] prototype
 * @param {string} [name] name of effect
 * @param {Object} [descriptor] function to handle effect
 */
export function effect(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = SinkBuilder.get(target);
  sinkBuilder.effects[name] = descriptor.value;
}
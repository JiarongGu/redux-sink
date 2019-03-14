
import { getSinkBuilder } from '../sink-builder';
import { Constructor } from '../types';

export function trigger(action: string, service?: Constructor, priority?: number) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = getSinkBuilder(target);
    const process = descriptor.value.bind(target);

    if (!sinkBuilder.built) {
      sinkBuilder.triggers.push({ process, action, service, priority });
    }
    return descriptor;
  }
}
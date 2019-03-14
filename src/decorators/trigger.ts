
import { getSinkBuilder } from '../sink-builder';
import { Constructor } from '../types';

export function trigger(action: string, service?: Constructor, priority?: number) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = getSinkBuilder(target);
    const process = descriptor.value.bind(target);
    const eventProcess = (payload) => process(...payload);

    if (!sinkBuilder.built) {
      sinkBuilder.triggers.push({
        process: eventProcess,
        action,
        service,
        priority
      });
    }
    return descriptor;
  }
}
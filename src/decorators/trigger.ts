
import { SinkBuilder } from '../SinkBuilder';
import { Constructor } from '../typings';

export function trigger(action: string, priority?: number, ensure?: Constructor) {
  // ensure sink built
  if (ensure && !SinkBuilder.get(ensure.prototype).built)
    new ensure();

  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = SinkBuilder.get(target);
    if (!sinkBuilder.built) {
      const handler = descriptor.value.bind(target);
      sinkBuilder.triggers.push({ handler, action, priority });
    }
    return descriptor;
  }
}
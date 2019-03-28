
import { SinkBuilder } from '../SinkBuilder';
import { Constructor } from '../typings';

export function trigger(action: string, priority?: number, sink?: Constructor) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = SinkBuilder.get(target);
    const handler = descriptor.value.bind(target);
    sinkBuilder.triggers[action] = { handler, action, priority, sink };
  }
}
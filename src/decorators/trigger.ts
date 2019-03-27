
import { SinkBuilder } from '../SinkBuilder';
import { Constructor } from '../typings';
import { ensureSinkBuilt } from '../ensureSinksBuilt';

export function trigger(action: string, priority?: number, sink?: Constructor) {
  // ensure sink built
  if (sink) ensureSinkBuilt(sink);

  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = SinkBuilder.get(target);
    const handler = descriptor.value.bind(target);
    sinkBuilder.triggers[action] = { handler, action, priority };
  }
}
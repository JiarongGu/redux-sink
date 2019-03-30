
import { SinkBuilder } from '../SinkBuilder';
import { TriggerOptions } from '../typings';

export function trigger(action: string, reload: boolean = false, options?: TriggerOptions) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = SinkBuilder.get(target);
    const handler = descriptor.value.bind(target);
    sinkBuilder.triggers[action] = { handler, action, reload, options };
  }
}
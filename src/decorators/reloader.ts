
import { SinkBuilder } from '../SinkBuilder';

export function reloader(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = SinkBuilder.get(target);
  if (!sinkBuilder.built) {
    sinkBuilder.reloaders.push(name);
  }
  return descriptor;
}
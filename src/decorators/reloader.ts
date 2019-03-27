
import { SinkBuilder } from '../SinkBuilder';

export function reloader(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = SinkBuilder.get(target);
  sinkBuilder.reloaders[name] = name;
}
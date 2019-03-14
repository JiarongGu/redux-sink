
import { getSinkBuilder } from '../sink-builder';

export function retrigger(target: any, name: string, descriptor: PropertyDescriptor) {
  const sinkBuilder = getSinkBuilder(target);
  if (!sinkBuilder.built) {
    sinkBuilder.retriggers.push(name);
  }
  return descriptor;
}
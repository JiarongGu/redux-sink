import { getSinkBuilder } from '../sink-builder';

export function state(target: any, name: string) {
  const sinkBuilder = getSinkBuilder(target);
  if (!sinkBuilder.built) {
    if (sinkBuilder.stateProperty == undefined) {
      sinkBuilder.stateProperty = name;
    }
  }
}
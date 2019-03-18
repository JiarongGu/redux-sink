import { SinkBuilder } from '../SinkBuilder';

/**
 * 
 * @param target prototype
 * @param name state property name in sink
 */
export function state(target: any, name: string) {
  const sinkBuilder = SinkBuilder.get(target);
  if (!sinkBuilder.built) {
    if (sinkBuilder.stateProperty === undefined) {
      sinkBuilder.stateProperty = name;
    }
  }
}
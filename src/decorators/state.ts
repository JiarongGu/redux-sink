import { SinkBuilder } from '../SinkBuilder';

/**
 * assign property to be the state property to hold the state inside sink
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
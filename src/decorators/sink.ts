import { SinkBuilder } from '../SinkBuilder';
import { Constructor } from '../typings';
import { SinkContainer } from './../SinkContainer';

/**
 * class decorator for create sink
 * @param {string} [namespace]
 * name of the sink, also the state name in store, cannot be duplicated across sinks
 * @param {...*} [injects]
 * inject sink or objects like sink factory to sink constructor,
 * if inject with sink class, it will be auto resolved to sink object
 */
export function sink(namespace: string, ...injects: Array<Constructor | SinkContainer>) {
  return function <T extends Constructor>(constructor: T) {
    const prototype = constructor.prototype;
    const sinkBuilder = SinkBuilder.get(prototype);
    sinkBuilder.namespace = namespace;
    sinkBuilder.sinkConstructor = constructor;
    sinkBuilder.sinkInjects = injects;

    return constructor;
  };
}

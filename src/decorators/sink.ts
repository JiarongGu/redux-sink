import { SinkBuilder } from '../SinkBuilder';
import { Constructor } from '../typings';
import { SinkFactory } from '../SinkFactory';

/**
 * create sink based on class, sink instance will be shared in prototype scope
 * @param namespace name of the sink, will be state name in store
 */
export function sink(namespace: string) {
  return function <T extends Constructor>(constructor: T) {
    const prototype = constructor.prototype;
    const sinkBuilder = SinkBuilder.get(prototype);
    sinkBuilder.namespace = namespace;
    
    return class extends constructor {
      constructor(...args: Array<any>) {
        super(...args);
        sinkBuilder.apply(this);
        sinkBuilder.build(SinkFactory);
      }
    };
  }
}
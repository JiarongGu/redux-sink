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
        // transform class into sink
        sinkBuilder.apply(this);

        // apply skin with factory settings
        SinkFactory.addSink(sinkBuilder);
      }
    };
  }
}
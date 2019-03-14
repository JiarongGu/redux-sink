import { getSinkBuilder } from '../sink-builder';
import { Constructor } from '../types';

export function sink(namespace: string) {
  return function <T extends Constructor>(constructor: T) {
    const prototype = constructor.prototype;
    const sinkBuilder = getSinkBuilder(prototype);

    return class extends constructor {
      constructor(...args: Array<any>) {
        super(...args);

        // do not build second time
        if (!sinkBuilder.built) {
          const properties = Object.keys(this).reduce((properties: any, key) => {
            properties[key] = this[key];
            return properties;
          }, {});

          sinkBuilder.properties = properties;
          sinkBuilder.build(namespace, prototype);
        }

        // remove all properties, so we only get them from prototype
        Object.keys(sinkBuilder.properties).forEach((key) => {
          delete this[key]
        });
      }
    };
  }
}
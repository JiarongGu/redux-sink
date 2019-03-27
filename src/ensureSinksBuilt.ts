import { Constructor } from './typings';
import { SinkBuilder } from './SinkBuilder';

export function ensureSinkBuilt(sink: Constructor) {
    const builder = SinkBuilder.get(sink.prototype);
    if (!builder.built)
      new sink();
    return builder;
}
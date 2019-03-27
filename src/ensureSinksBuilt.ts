import { Constructor } from './typings';
import { SinkFactory } from './SinkFactory';
import { SinkBuilder } from './SinkBuilder';

export function ensureSinkBuilt(sink: Constructor, factory: SinkFactory) {
    if (!factory.contains(sink.prototype)) 
      new sink();
    return SinkBuilder.get(sink.prototype);
}
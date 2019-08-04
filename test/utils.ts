import { SinkConfiguration, SinkContainer } from '../src';

export function createFactory(config?: SinkConfiguration, sinkFactory?: SinkContainer) {
  const factory = sinkFactory || new SinkContainer();
  const store = factory.createStore(config);
  return { factory, store };
}

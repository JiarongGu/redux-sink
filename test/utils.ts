import { SinkContainer, StoreConfiguration } from '../src';

export function createFactory(config?: StoreConfiguration, sinkFactory?: SinkContainer) {
  const factory = sinkFactory || new SinkContainer();
  const store = factory.createStore(config);
  return { factory, store };
}

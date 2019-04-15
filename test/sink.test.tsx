import { assert } from 'chai';
import { StateOnlySink } from './sinks';
import { SinkFactory, SinkFactoryClass } from '../src/SinkFactory';
import { StoreConfiguration } from '../src/typings';

export function createFactory(config?: StoreConfiguration, sinkFactory?: SinkFactoryClass) {
  const factory = sinkFactory || new SinkFactoryClass();
  const store = factory.createStore(config);
  return { factory, store };
}

export function resetStore() {
  SinkFactory.container.setStore(undefined as any);
  SinkFactory.container.sinks = {};
}

describe('redux-sink unit test', () => {
  it('can init state from sink', () => {
    const { factory, store } = createFactory();
    const stateOnlySink = factory.sink(StateOnlySink);
    const state = store.getState() as any;

    assert.equal(state['stateOnly'].firststate, stateOnlySink.firststate);
    assert.equal(state['stateOnly'].secondState, stateOnlySink.secondState);
  });
})
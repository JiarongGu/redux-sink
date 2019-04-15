import { assert } from 'chai';
import { StateOnlySink } from './sinks';
import { StoreConfiguration } from '../src/typings';
import { SinkContainer } from '../src';

export function createFactory(config?: StoreConfiguration, sinkContainer?: SinkContainer) {
  const factory = sinkContainer || new SinkContainer();
  const store = factory.createStore(config);
  return { factory, store };
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
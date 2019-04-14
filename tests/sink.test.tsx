import { assert } from 'chai';
import { StateOnlySink } from './sinks';
import { SinkFactory } from '../src/SinkFactory';
import { StoreConfiguration } from '../src/typings';

export function initalizeStore(config?: StoreConfiguration) {
  const store = SinkFactory.createStore(config);
  SinkFactory.container.sinks = {};
  return store;
}

export function resetStore() {
  SinkFactory.container.setStore(undefined as any);
  SinkFactory.container.sinks = {};
}

describe('redux-sink unit test', () => {
  it('can init state from sink', () => {
    const store = initalizeStore();
    const stateOnlySink = SinkFactory.get(StateOnlySink);
    const state = store.getState() as any;
    assert.equal(state['stateOnly'], stateOnlySink.onlystate);
  });
})
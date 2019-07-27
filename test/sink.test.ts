import { assert } from 'chai';
import { TestSink, TestSink2, TestSink3, StateOnlySink } from './sinks';
import { StoreConfiguration } from '../src/typings';
import { SinkContainer } from '../src';

export function createFactory(config?: StoreConfiguration, sinkFactory?: SinkContainer) {
  const factory = sinkFactory || new SinkContainer();
  const store = factory.createStore(config);
  return { factory, store };
}

describe('sink test', () => {
  it('can inherit state from store', () => {
    const state = { name: 'initalized name' };
    const { factory, store } = createFactory({
      preloadedState: {
        testSink: { state }
      }
    });
    const testSink = factory.sink(TestSink);
    assert.equal(state, testSink.state);
  });

  it('can inherit state from sink', () => {
    const { factory, store } = createFactory();
    const stateOnlySink = factory.sink(StateOnlySink);
    const state = store.getState() as any;

    assert.equal(state['stateOnly'].firststate, stateOnlySink.firststate);
    assert.equal(state['stateOnly'].secondState, stateOnlySink.secondState);
  });

  it('can state match after instance applied', () => {
    const { factory, store } = createFactory();
    const testSink = factory.sink(TestSink3);
    const state = store.getState() as any;
    assert.equal(testSink.name, state['testSink3'].name);
  });

  it('can share state between instance', () => {
    const { factory, store } = createFactory();
    const testSink1 = factory.sink(TestSink);
    const testSink2 = factory.sink(TestSink);
    assert.equal(testSink1.state, testSink2.state);
  });

  it('can share property between instance', () => {
    const { factory, store } = createFactory();
    const testSink1 = factory.sink(TestSink2);
    const testSink2 = factory.sink(TestSink2);
    testSink2.setProp((prop) => { assert.equal(1, prop) });
    testSink1.setProp((prop) => { assert.equal(2, prop) });
  });

  it('can sink created before store initalized', () => {
    const factory = new SinkContainer();
    const testSink = factory.sink(TestSink);

    const state = { name: 'initalized name before store' };
    const store = factory.createStore({ preloadedState: { testSink: { state } } });

    assert.equal(state, testSink.state);
  });

  it('can call multiple reducers from effect', () => {
    const { factory, store } = createFactory();
    const testSink = factory.sink(TestSink);
    testSink.setAll('test name', 'test value');
    const state = testSink.state;
    assert.equal('test name', state.name);
    assert.equal('test value', state.value);
  });

  it('can sink call reducers from other sink by effect', () => {
    const { factory, store } = createFactory();
    const testSink = factory.sink(TestSink);
    const testSink2 = factory.sink(TestSink2);
    testSink2.setName('new name hahah');
    const state = store.getState();
    assert.equal('new name hahah', testSink.state.name);
  });

  it('can sink update other sinks state', () => {
    const { factory, store } = createFactory();
    const testSink = factory.sink(TestSink);
    const testSink2 = factory.sink(TestSink2);
    testSink2.directUpdateName('new name hahah');
    const state = store.getState() as any;
    assert.equal('new name hahah', testSink.state.name);
    assert.equal(testSink.state.name, state.testSink.state.name);
  });

  it('can trigger run when action detected', () => {
    const { factory, store } = createFactory();
    const testSink = factory.sink(TestSink);
    testSink.setAll('test name', 'test value');
    assert.equal('test name', testSink.state.copy);
  });

  it('cant set store state', () => {
    const { factory, store } = createFactory();
    const testSink = factory.sink(TestSink);
    testSink.setAll('test name', 'test value');
    assert.equal('test name', testSink.state.copy);
  });
})
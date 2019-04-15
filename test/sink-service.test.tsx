import { assert } from 'chai';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { renderToString } from 'react-dom/server';
import { sinking, createSinking } from '../src/decorators';
import { TestSink, TestSink2, TestSink3 } from './sinks';
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

describe('redux sink integration', () => {
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
    resetStore();
    const state = { name: 'initalized name before store' };
    const testSink = SinkFactory.sink(TestSink);
    const store = SinkFactory.createStore({ preloadedState: { testSink: { state } } });

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

  it('can connect to component with state sink', () => {
    const state = { name: 'initalized name' };
    const { factory, store } = createFactory({ preloadedState: { testSink: { state } } });

    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>
    }
    const app = createApp(store, createSinking(factory)(TestSink), TestComponent);
    assert.equal(renderToString(app), '<div>initalized name</div>');

    const testSink = factory.sink(TestSink);
    testSink.setAll('test name', 'test value');
    assert.equal(renderToString(app), '<div>test name</div>');
  });

  it('can connect to component with non-state sink', () => {
    const { factory, store } = createFactory();
    const testSink2 = factory.sink(TestSink2);
    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>
    }
    testSink2.setName('test name');
    const app = createApp(store, createSinking(factory)(TestSink), TestComponent);
    const state = store.getState();
    assert.equal(renderToString(app), '<div>test name</div>');
  });
})

function createApp(store: Store, connecter: Function, component: any) {
  const ConnectedComponent = connecter(component);
  return <Provider store={store}><ConnectedComponent /></Provider>;
}
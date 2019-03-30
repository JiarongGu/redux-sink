import { assert } from 'chai';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { renderToString } from 'react-dom/server';
import { sinking } from '../src/decorators';
import { TestSink, Test2Sink, TestSink3 } from './sinks';
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

describe('redux sink', () => {
  it('can inherit state from store', () => {
    const state = { name: 'initalized name' };
    const store = initalizeStore({ preloadedState: { testSink: state } });
    const testSink = new TestSink();
    assert.equal(state, testSink.state);
  });

  it('can state match after instance applied', () => {
    const store = initalizeStore();
    const testSink = new TestSink3();
    const state = store.getState() as any;
    assert.equal(testSink.name, state['testSink3']);
  });

  it('can share state between instance', () => {
    const store = initalizeStore();
    const testSink1 = new TestSink();
    const testSink2 = new TestSink();
    assert.equal(testSink1.state, testSink2.state);
  });

  it('can share property between instance', () => {
    const store = initalizeStore();
    const testSink1 = new Test2Sink();
    const testSink2 = new Test2Sink();
    testSink2.setProp((prop) => { assert.equal(1, prop) });
    testSink1.setProp((prop) => { assert.equal(2, prop) });
  });

  it('can sink created before store initalized', () => {
    resetStore();
    const state = { name: 'initalized name before store' };
    const testSink = new TestSink();
    const store = SinkFactory.createStore({ preloadedState: { testSink: state } });

    assert.equal(state, testSink.state);
  });

  it('can call multiple reducers from effect', () => {
    const store = initalizeStore();
    const testSink = new TestSink();
    testSink.setAll('test name', 'test value');
    const state = testSink.state;
    assert.equal('test name', state.name);
    assert.equal('test value', state.value);
  });

  it('can sink call reducers from other sink by effect', () => {
    const store = initalizeStore();
    const testSink = new TestSink();
    const test2Sink = new Test2Sink();
    test2Sink.setName('new name hahah');
    assert.equal('new name hahah', testSink.state.name);
  });

  it('can trigger run when action detected', () => {
    const store = initalizeStore();
    const testSink = new TestSink();
    testSink.setAll('test name', 'test value');
    assert.equal('test name', testSink.state.copy);
  });

  it('can connect to component with state sink', () => {
    const state = { name: 'initalized name' };
    const store = initalizeStore({ preloadedState: { testSink: state } });

    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>
    }
    const app = createApp(store, sinking(TestSink), TestComponent);
    assert.equal(renderToString(app), '<div>initalized name</div>');
    
    const testSink = new TestSink();
    testSink.setAll('test name', 'test value');
    assert.equal(renderToString(app), '<div>test name</div>');
  });

  it('can connect to component with non-state sink', () => {
    const store = initalizeStore();
    const test2Sink = new Test2Sink();
    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>
    }
    test2Sink.setName('test name');
    const app = createApp(store, sinking(TestSink), TestComponent);
    assert.equal(renderToString(app), '<div>test name</div>');
  });
})

function createApp(store: Store, connecter: Function, component: any) {
  const ConnectedComponent = connecter(component);
  return <Provider store={store}><ConnectedComponent /></Provider>;
}
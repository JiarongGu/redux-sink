import { assert } from 'chai';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { renderToString } from 'react-dom/server';
import { sinking, deepsinking } from '../src/decorators';
import { TestSink, Test2Sink } from './sinks';
import { SinkFactory } from '../src/SinkFactory';
import { StoreConfiguration } from '../src/typings';
import { SinkBuilder } from '../src/SinkBuilder';

export function initalizeStore(config?: StoreConfiguration) {
  const store = SinkFactory.createStore(config);
  // reset sinks
  SinkBuilder.get(TestSink).built = false;
  SinkBuilder.get(Test2Sink).built = false;
  return store;
}

export function resetStore() {
  SinkFactory.applyReduxSinkStore(undefined as any);
  SinkBuilder.get(TestSink).built = false;
  SinkBuilder.get(Test2Sink).built = false;
}

describe('redux sink', () => {
  it('can inherit state from store', () => {
    const state = { name: 'initalized name' };
    const store = initalizeStore({ preloadedState: { testSink: state } });
    const testSink = new TestSink();
    assert.equal(state, testSink.state);
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
    const store = initalizeStore();
    const testSink = new TestSink();
    testSink.setAll('test name', 'test value');
    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>
    }
    const app = createApp(store, sinking(TestSink), TestComponent);
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

  it('can use other function from deepsinking', () => {
    const store = initalizeStore();
    const test2Sink = new Test2Sink();

    const TestComponent = (props: { test2Sink: Test2Sink }) => {
      return <div>{props.test2Sink.state.name}</div>
    }
    test2Sink.setName('test name');
    const app = createApp(store, deepsinking(Test2Sink), TestComponent);
    assert.equal(renderToString(app), '<div>test name</div>');
  });
})

function createApp(store: Store, connecter: Function, component: any) {
  const ConnectedComponent = connecter(component);
  return <Provider store={store}><ConnectedComponent /></Provider>;
}
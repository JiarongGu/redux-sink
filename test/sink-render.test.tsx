import { assert } from 'chai';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { renderToString } from 'react-dom/server';
import { TestSink, TestSink2 } from './sinks';
import { StoreConfiguration } from '../src/typings';
import { SinkContainer, createSinking, useSink } from '../src';

export function createFactory(config?: StoreConfiguration, sinkFactory?: SinkContainer) {
  const factory = sinkFactory || new SinkContainer();
  const store = factory.createStore(config);
  return { factory, store };
}

describe('sink render test', () => {
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

  it('can connect to component hooks', () => {
    const { factory, store } = createFactory();
    const testSink2 = factory.sink(TestSink2);
    const TestComponent = () => {
      const testSink = useSink(TestSink);
      return <div>{testSink!.state.name}</div>
    }
    testSink2.setName('test name');
    const app = <Provider store={store}><TestComponent /></Provider>;
    const state = store.getState();
    assert.equal(renderToString(app), '<div>test name</div>');
  });
})

function createApp(store: Store, connecter: Function, component: any) {
  const ConnectedComponent = connecter(component);
  return <Provider store={store}><ConnectedComponent /></Provider>;
}
import { assert } from 'chai';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { createSinking, useSink } from '../src';
import { createUseSink } from '../src/createUseSink';
import { AnyFunction } from '../src/typings';
import { TestSink, TestSink2 } from './sinks';
import { createFactory } from './utils';

describe('sink render test', () => {
  it('can connect to component with state sink', () => {
    const state = { name: 'initialized name' };
    const { factory, store } = createFactory({ preloadedState: { testSink: { state } } });

    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>;
    };
    const app = createApp(store, createSinking(factory)(TestSink, (sink) => [sink.state]), TestComponent);
    assert.equal(renderToString(app), '<div>initialized name</div>');

    const testSink = factory.getSink(TestSink);
    testSink.setAll('test name', 'test value');
    assert.equal(renderToString(app), '<div>test name</div>');
  });

  it('can connect to component with non-state sink', () => {
    const { factory, store } = createFactory();
    const testSink2 = factory.getSink(TestSink2);
    const TestComponent = (props: { testSink: TestSink }) => {
      return <div>{props.testSink.state!.name}</div>;
    };
    testSink2.setName('test name');
    const app = createApp(store, createSinking(factory)(TestSink), TestComponent);
    const state = store.getState();
    assert.equal(renderToString(app), '<div>test name</div>');
  });

  it('can connect to component hooks', () => {
    const { factory, store } = createFactory();
    const testSink2 = factory.getSink(TestSink2);
    const TestComponent = () => {
      const testSink = useSink(TestSink);
      return <div>{testSink!.state.name}</div>;
    };
    testSink2.setName('test name');
    const app = <Provider store={store}><TestComponent /></Provider>;
    const state = store.getState();
    assert.equal(renderToString(app), '<div>test name</div>');
  });

  it('can connect to component hooks with no subscribe', () => {
    const { factory, store } = createFactory();
    const testSink2 = factory.getSink(TestSink2);
    const useSinkCustom = createUseSink(factory);

    const TestComponent = () => {
      const testSink = useSinkCustom(TestSink, false);
      return <div>{testSink!.state.name}</div>;
    };
    testSink2.setName('test name');
    const app = <Provider store={store}><TestComponent /></Provider>;
    const state = store.getState();
    assert.equal(renderToString(app), `<div>test name</div>`);
  });
});

function createApp(store: Store, connecter: AnyFunction, component: any) {
  const ConnectedComponent = connecter(component);
  return <Provider store={store}><ConnectedComponent /></Provider>;
}

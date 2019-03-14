import { assert } from 'chai';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { renderToString } from 'react-dom/server';
import { sinking, deepsinking } from '../src/decorators';
import { TestService, Test2Service } from './redux-service/TestService';
import { configureSinkStore } from '../src/configureStore';
import { getSinkBuilder } from '../src/sink-builder';
import { applyReduxSinkStore } from '../src/redux-registry';
import { StoreConfiguration } from '../src/types';

export function initalizeStore(config?: StoreConfiguration) {
  const store = configureSinkStore(config);
  // reset services
  getSinkBuilder(TestService.prototype).built = false;
  getSinkBuilder(Test2Service.prototype).built = false;
  return store;
}

export function resetStore() {
  applyReduxSinkStore(undefined as any);
  getSinkBuilder(TestService.prototype).built = false;
  getSinkBuilder(Test2Service.prototype).built = false;
}

describe('redux service', () => {
  it('can inherit state from store', () => {
    const state = { name: 'initalized name' };
    const store = initalizeStore({ preloadedState: { TestService: state } });
    const testService = new TestService();
    assert.equal(state, testService.state);
  });

  it('can share state between instance', () => {
    const store = initalizeStore();
    const testService1 = new TestService();
    const testService2 = new TestService();
    assert.equal(testService1.state, testService2.state);
  });

  it('can share property between instance', () => {
    const store = initalizeStore();
    const testService1 = new Test2Service();
    const testService2 = new Test2Service();
    testService2.setProp((prop) => { assert.equal(1, prop) });
    testService1.setProp((prop) => { assert.equal(2, prop) });
  });

  it('can service created before store initalized', () => {
    resetStore();
    const state = { name: 'initalized name before store' };
    const testService = new TestService();
    const store = configureSinkStore({ preloadedState: { TestService: state } });

    assert.equal(state, testService.state);
  });

  it('can call multiple reducers from effect', () => {
    const store = initalizeStore();
    const testService = new TestService();
    testService.setAll('test name', 'test value');
    const state = testService.state;
    assert.equal('test name', state.name);
    assert.equal('test value', state.value);
  });

  it('can service call reducers from other service by effect', () => {
    const store = initalizeStore();
    const testService = new TestService();
    const test2Service = new Test2Service();
    test2Service.setName('new name hahah');
    assert.equal('new name hahah', testService.state.name);
  });

  it('can trigger run when action detected', () => {
    const store = initalizeStore();
    const testService = new TestService();
    testService.setAll('test name', 'test value');
    assert.equal('test name', testService.state.copy);
  });

  it('can connect to component with state service', () => {
    const store = initalizeStore();
    const testService = new TestService();
    testService.setAll('test name', 'test value');
    const TestComponent = (props: { TestService: TestService }) => {
      return <div>{props.TestService.state!.name}</div>
    }
    const app = createApp(store, sinking(TestService), TestComponent);
    assert.equal('<div>test name</div>', renderToString(app));
  });

  it('can connect to component with non-state service', () => {
    const store = initalizeStore();
    const test2Service = new Test2Service();
    const TestComponent = (props: { TestService: TestService }) => {
      return <div>{props.TestService.state!.name}</div>
    }
    test2Service.setName('test name');
    const app = createApp(store, sinking(TestService), TestComponent);
    assert.equal('<div>test name</div>', renderToString(app));
  });

  it('can use other function from deepsinking', () => {
    const store = initalizeStore();
    const test2Service = new Test2Service();

    const TestComponent = (props: { Test2Service: Test2Service }) => {
      return <div>{props.Test2Service.state.name}</div>
    }
    test2Service.setName('test name');
    const app = createApp(store, deepsinking(Test2Service), TestComponent);
    assert.equal('<div>test name</div>', renderToString(app));
  });
})

function createApp(store: Store, connecter: Function, component: any) {
  const ConnectedComponent = connecter(component);
  return <Provider store={store}><ConnectedComponent /></Provider>;
}
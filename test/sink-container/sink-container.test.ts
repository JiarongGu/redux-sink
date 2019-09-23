import { assert } from 'chai';

import { SinkContainer } from '../../src/SinkContainer';
import { CallBackSink } from './models/CallBackSink';

describe('sink container test', () => {
  let container: SinkContainer;

  beforeEach(() => {
    container = new SinkContainer();
    container.createStore();
  });

  describe('create store', () => {
    it('should create store', () => {
      const store = container.createStore();
      assert.isNotNull(store);
    });
  });

  describe('create sink', () => {
    it('should create same sink instance with same class', () => {
      const sink1 = container.getSink(CallBackSink);
      const sink2 = container.getSink(CallBackSink);
      assert.equal(sink1, sink2);
    });

    it('should update same property by effect', () => {
      const sink1 = container.getSink(CallBackSink);
      const sink2 = container.getSink(CallBackSink);

      // assert 1
      const value1 = 5;
      sink1.callback(sink => sink.value = value1);
      assert.equal(sink2.value, value1);

      // assert 2
      const value2 = 10;
      container.invokeEffect({
        effect: true,
        payload: [ (sink: CallBackSink) => sink.value = value2 ],
        type: 'callback/callback'
      });
      assert.equal(sink1.value, value2);
      assert.equal(sink2.value, value2);
    });
  });
});

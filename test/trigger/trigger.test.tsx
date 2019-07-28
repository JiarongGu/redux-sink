import { assert } from 'chai';
import { createFactory } from '../utils';
import { NonLazyTriggerSink } from './NonLazyTriggerSInk';
import { OriginSink } from './OriginSink';
import { TriggerSink } from './TriggerSink';

describe('trigger test', () => {
  describe('lazy load', () => {
    it('should enable', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      originSink.update1('origin update1');

      const triggerSink = factory.sink(TriggerSink);
      assert.equal(triggerSink.value, originSink.value);
    });

    it('should disable', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      originSink.update1('origin update1');

      const triggerSink = factory.sink(NonLazyTriggerSink);
      assert.equal(triggerSink.value, 'trigger');
    });

    it('should update on second trigger for disabled', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      originSink.update1('origin update1');

      const triggerSink = factory.sink(NonLazyTriggerSink);
      originSink.update1('origin update2');
      assert.equal(triggerSink.value, 'origin update2');
    });
  });

  describe('formatter', () => {
    it('should format', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      const triggerSink = factory.sink(TriggerSink);

      originSink.update2('origin update1');
      assert.equal(triggerSink.value, 'origin update1 trigger');
    });
  });

  describe('raw action', () => {
    it('should use raw action', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      const triggerSink = factory.sink(TriggerSink);

      originSink.update3('origin update1');
      assert.equal(triggerSink.value, 'origin/update3');
    });
  });

  describe('effect', () => {
    it('should work with multiple params', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      const triggerSink = factory.sink(TriggerSink);

      originSink.update4('origin', ' update4');
      assert.equal(triggerSink.value, 'origin update4');
    });
  });

  describe('state', () => {
    it('should work with state', () => {
      const { factory } = createFactory();
      const originSink = factory.sink(OriginSink);
      const triggerSink = factory.sink(TriggerSink);

      originSink.value = 'new value';
      assert.equal(triggerSink.originValue, 'new value');
    });
  });
});

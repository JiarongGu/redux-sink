import { assert } from 'chai';
import { SinkContainer } from '../../src';
import { createFactory } from '../utils';
import { NonLazyTriggerSink } from './models/NonLazyTriggerSInk';
import { OriginSink } from './models/OriginSink';
import { TriggerSink } from './models/TriggerSink';

describe('trigger test', () => {
  let container: SinkContainer;

  beforeEach(() => {
    const { factory } = createFactory({ useTrigger: true });
    container = factory;
  });

  describe('lazy load', () => {
    it('should enable', () => {
      const originSink = container.getSink(OriginSink);
      originSink.update1('origin update1');

      const triggerSink = container.getSink(TriggerSink);
      assert.equal(triggerSink.value, originSink.value);
    });

    it('should disable', () => {
      const originSink = container.getSink(OriginSink);
      originSink.update1('origin update1');

      const triggerSink = container.getSink(NonLazyTriggerSink);
      assert.equal(triggerSink.value, 'trigger');
    });

    it('should update on second trigger for disabled', () => {
      const originSink = container.getSink(OriginSink);
      originSink.update1('origin update1');

      const triggerSink = container.getSink(NonLazyTriggerSink);
      originSink.update1('origin update2');
      assert.equal(triggerSink.value, 'origin update2');
    });
  });

  describe('formatter', () => {
    it('should format', () => {
      const originSink = container.getSink(OriginSink);
      const triggerSink = container.getSink(TriggerSink);

      originSink.update2('origin update1');
      assert.equal(triggerSink.value, 'origin update1 trigger');
    });
  });

  describe('raw action', () => {
    it('should use raw action', () => {
      const originSink = container.getSink(OriginSink);
      const triggerSink = container.getSink(TriggerSink);

      originSink.update3('origin update1');
      assert.equal(triggerSink.value, 'origin/update3');
    });
  });

  describe('effect', () => {
    it('should work with multiple params', () => {
      const originSink = container.getSink(OriginSink);
      const triggerSink = container.getSink(TriggerSink);

      originSink.update4('origin', ' update4');
      assert.equal(triggerSink.value, 'origin update4');
    });
  });

  describe('state', () => {
    it('should work with state', () => {
      const originSink = container.getSink(OriginSink);
      const triggerSink = container.getSink(TriggerSink);

      originSink.value = 'new value';
      assert.equal(triggerSink.originValue, 'new value');
    });
  });
});

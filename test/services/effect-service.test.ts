import { assert } from 'chai';

import { EffectHandler, SinkAction } from '../../src';
import { EffectService } from '../../src/services';

describe('effect service test', () => {
  const theories = [true, false];

  theories.forEach((enableTrace) => {
    describe(`trace ${enableTrace ? 'enabled' : 'disabled'}`, () => {
      let service: EffectService;

      beforeEach(() => {
        service = new EffectService();
        service.enableTrace = enableTrace;
      });

      it('not found should return promise', () => {
        const action: SinkAction = { type: 'any', payload: undefined };
        const promise = service.invoke(action).value;
        assert.isTrue(promise instanceof Promise);
        promise.then(result => {
          assert.isUndefined(result);
        });
      });

      it('should handle undefined payload', () => {
        const handler: EffectHandler = (payload: undefined) => payload;
        const actionType = 'test';
        const action: SinkAction = { type: actionType, payload: undefined };
        service.addEffect(actionType, handler);

        const promise = service.invoke(action).value;
        assert.isTrue(promise instanceof Promise);

        promise.then(result => {
          assert.isUndefined(result);
        });
      });

      it('should handle action', () => {
        const handler: EffectHandler = (payload: number) => payload;
        const actionType = 'test';
        const actionPayload = 5;
        const action: SinkAction = {
          payload: actionPayload,
          type: actionType
        };
        service.addEffect(actionType, handler);

        const promise = service.invoke(action).value;
        assert.isTrue(promise instanceof Promise);

        promise.then(result => {
          assert.equal(result, actionPayload);
        });
      });

      it('should handle async handler', () => {
        const handler: EffectHandler = (payload: number) =>
          new Promise((resolve, reject) => {
            setTimeout(() => resolve(payload), 100);
          });
        const actionType = 'test';
        const actionPayload = 5;
        const action: SinkAction = {
          payload: actionPayload,
          type: actionType
        };
        service.addEffect(actionType, handler);

        const promise = service.invoke(action).value;

        if (enableTrace) {
          assert.equal(service.tasks.length, 1);
        } else {
          assert.equal(service.tasks.length, 0);
        }

        assert.isTrue(promise instanceof Promise);

        promise.then(result => {
          assert.equal(result, actionPayload);
        }).catch(() => {
          assert.fail('should not fail');
        });
      });

      it('should throw exception when async handler error', () => {
        const handler: EffectHandler = (payload: string) => {
          return new Promise((resolve, reject) => reject(payload));
        };
        const actionType = 'test';
        const actionPayload = 'test error';
        const action: SinkAction = {
          payload: actionPayload,
          type: actionType
        };
        service.addEffect(actionType, handler);
        const promise1 = service.invoke(action);
        const promise2 = service.invoke(action);

        if (enableTrace) {
          assert.equal(service.tasks.length, 2);
        } else {
          assert.equal(service.tasks.length, 0);
        }

        Promise.all([promise1.value, promise2.value])
          .catch((error) => {
            assert.equal(actionPayload, error);
            assert.equal(0, service.tasks.length);
          });
      });
    });
  });
});

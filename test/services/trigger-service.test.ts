import { assert } from 'chai';
import { TriggerService } from '../../src/services';

describe('trigger service test', () => {
  let service: TriggerService;
  beforeEach(() => {
    service = new TriggerService();
  });

  describe('add trigger', () => {
    it('should added by priority', () => {
      const actionType = 'test';

      service.addTrigger(actionType, () => 0, {});
      service.addTrigger(actionType, () => 1, { priority: 1 });
      service.addTrigger(actionType, () => 2, { priority: 2 });

      const events = service.eventsMap.get(actionType);

      if (events) {
        Promise.all(events.map(x => x.handler())).then(results => {
          assert.equal(results[0], 2);
          assert.equal(results[1], 1);
          assert.equal(results[2], 0);
        });
      } else {
        assert.fail('events not found');
      }
    });

    it('should invoke when lazy loaded trigger', () => {
      const actionType = 'test';
      service.addTrigger(actionType, () => 0, {});
      service.invoke({ type: actionType, payload: 10 });

      let invoked = false;
      service.addTrigger(actionType, () => { invoked = true; }, { lazyLoad: true });

      assert.isTrue(invoked);
    });
  });

  describe('invoke', () => {
    it('should be able to handle promise handler', () => {
      const actionType = 'test';

      service.addTrigger(actionType, () => new Promise(resolve => resolve(0)), {});
      service.addTrigger(actionType, () => new Promise(resolve => resolve(1)), {});
      service.addTrigger(actionType, () => new Promise(resolve => resolve(2)), {});

      service.invoke({ type: actionType, payload: 10 }).value
        .then(results => {
          assert.equal(results[0], 0);
          assert.equal(results[1], 1);
          assert.equal(results[2], 2);
        });
    });
  });
});

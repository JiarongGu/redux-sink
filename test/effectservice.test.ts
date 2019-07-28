import { assert } from 'chai';
import { EffectService } from '../src/services';

describe('effect service test', () => {
  it('can add promise task', () => {
    const service = new EffectService();
    const testMessage = 'test message';

    const promise = new Promise((resolve) => {
      resolve(testMessage);
    }).then(result => {
      assert.equal(result, testMessage);
      assert.equal(service.effectTasks.length, 0);
    });

    service.addEffectTask(promise);

    assert.equal(service.effectTasks.length, 1);
  });
});

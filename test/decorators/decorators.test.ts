import { assert } from 'chai';
import { SinkBuilder } from './../../src/SinkBuilder';

import { state } from '../../src';
import { createFactory } from '../utils';

describe('decorators test', () => {
  describe('@state', () => {
    it('should create state in sink builder', () => {
      const testPrototype = {};
      const stateName = 'value';
      state(testPrototype, stateName);
      const builder = SinkBuilder.get(testPrototype);
      const stateKey = Object.keys(builder.state).find(x => x === stateName);
      assert.isDefined(stateKey);
      assert.isUndefined(builder.state.value);
    });
  });
});

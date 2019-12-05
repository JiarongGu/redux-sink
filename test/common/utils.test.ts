import { assert } from 'chai';
import { Reducer } from 'redux';

import { SinkAction } from '../../src';
import { buildReducer } from '../../src/utils';

describe('utils test', () => {
  describe('buildReducer', () => {
    let valueReducer: Reducer<any>;
    let buildTestReducer: (state?: any) => Reducer<any, SinkAction>;
    let otherAction: SinkAction;
    let valueAction: SinkAction;

    beforeEach(() => {
      valueReducer = (state, value) => ({...state, value});
      buildTestReducer = (state) => buildReducer(state, { value: valueReducer });
      otherAction = { type: 'other', payload: 5 };
      valueAction = { type: 'value', payload: 5 };
    });

    it('should handle other action without preloaded state', () => {
      const currentState = { value: 0 };
      const testReducer = buildTestReducer(undefined);
      const resultState = testReducer(currentState, otherAction);
      assert.equal(resultState, currentState);
    });

    it('should handle other action with preloaded state', () => {
      const defaultState = { value: 0 };
      const testReducer = buildTestReducer(defaultState);
      const resultState = testReducer(undefined, otherAction);
      assert.equal(resultState, defaultState);
    });

    it('should handle reducer action without preloaded state', () => {
      const currentState = { value: 0 };
      const testReducer = buildTestReducer(undefined);
      const resultState = testReducer(currentState, valueAction);
      assert.equal(resultState.value, valueAction.payload);
    });

    it('should handle reducer action with preloaded state', () => {
      const defaultState = { value: 0 };
      const testReducer = buildTestReducer(defaultState);
      const resultState = testReducer(undefined, valueAction);
      assert.equal(resultState.value, valueAction.payload);
    });
  });
});

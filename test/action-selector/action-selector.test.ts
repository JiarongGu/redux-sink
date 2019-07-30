import { assert } from 'chai';

import { createActionSelector } from '../../src';
import { createFactory } from '../utils';
import { TestSink } from './TestSink';

describe('action selector test', () => {
  it('should be able to select actions', () => {
    const { factory } = createFactory();
    const selector = createActionSelector(factory);

    const effect = selector(TestSink, sink => sink.effect);
    const state = selector(TestSink, sink => sink.state);

    assert.equal('test/effect', effect);
    assert.equal('test/state', state);
  });

  it('should return undefined when selection is not effect or state', () => {
    const { factory } = createFactory();
    const selector = createActionSelector(factory);

    const other = selector(TestSink, sink => sink.other);

    assert.isUndefined(other);
  });
});

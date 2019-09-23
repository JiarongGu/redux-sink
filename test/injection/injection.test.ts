import { SinkContainer } from './../../src/SinkContainer';
import { assert } from 'chai';

import { createFactory } from '../utils';
import { InjectableSink } from './models/InjectableSink';
import { TestSink } from './models/TestSink';

describe('sink injection test', () => {
  let container: SinkContainer;

  beforeEach(() => {
    const { factory } = createFactory();
    container = factory;
  });

  it('should not be null', () => {
    const testSink = container.getSink(TestSink);
    assert.isNotNull(testSink.injectableSink);
    assert.isNotNull(testSink.container);
    assert.isNotNull(testSink.factory);
  });

  it('should be able to handel inject not defined', () => {
    const testSink = container.getSink(TestSink);
    assert.isUndefined(testSink.notDefined);
  });

  it('should have correct values', () => {
    const testSink = container.getSink(TestSink);
    const injectableSink1 = container.getSink(InjectableSink);
    const injectableSink2 = testSink.container.getSink(InjectableSink);

    // update value in injectable sink1 of original container
    // should reflect to injectable sink in test sink
    injectableSink1.update('origin container');
    assert.equal(injectableSink1.value, testSink.injectableSink.value);

    // but injectable sink2 is from other container should not be effected
    assert.notEqual(injectableSink1.value, injectableSink2.value);
  });
});

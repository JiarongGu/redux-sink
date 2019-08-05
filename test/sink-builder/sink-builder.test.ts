import { assert } from 'chai';

import { SinkBuilder } from '../../src/SinkBuilder';
import { createFactory } from '../utils';
import { BaseModel } from './models/BaseModel';
import { InheritedModel } from './models/InheritedModel';

describe('sink builder test', () => {
  it('should create different builder even when inherited', () => {
    const baseBuilder = SinkBuilder.get(BaseModel.prototype);
    const inheritedBuilder = SinkBuilder.get(InheritedModel.prototype);
    assert.notEqual(baseBuilder, inheritedBuilder);
  });

  it('should be able to inherited states from base sink', () => {
    const { factory, store } = createFactory();
    const baseSink = factory.getSink(BaseModel);
    const inheritedSink = factory.getSink(InheritedModel);

    inheritedSink.value = 10;
    assert.equal(10, store.getState().inherited.value);
    baseSink.value = 5;
    assert.equal(5, store.getState().inherited.value);
    assert.equal(5, store.getState().base.value);
  });
});

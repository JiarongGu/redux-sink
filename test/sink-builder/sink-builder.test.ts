import { assert } from 'chai';

import { SinkBuilder } from '../../src/SinkBuilder';
import { createFactory } from '../utils';
import { BaseModel } from './models/BaseModel';
import { InheritedModel } from './models/InheritedModel';
import { InheritedModel2 } from './models/InheritedModel2';

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

    // test base model
    assert.equal(10, store.getState().base.value);
    baseSink.value = 5;
    assert.equal(5, store.getState().base.value);

    // test inherited model
    assert.equal(10, store.getState().inherited.value);
    inheritedSink.value = 5;
    assert.equal(5, store.getState().inherited.value);
  });

  it('should be able to override base state', () => {
    const { factory, store } = createFactory();
    const inheritedSink = factory.getSink(InheritedModel2);

    assert.equal(5, store.getState().inherited2.value);
  });
});

import { TestSink } from './TestSink';
import { sink, effect } from '../../src/decorators';
import { SinkConainerAPI } from '../../src';

@sink('testSink2')
export class TestSink2 {
  name: string = 'test';
  testSink: TestSink;
  value = 0;

  constructor(sinkContainer: SinkConainerAPI) {
    this.testSink = sinkContainer.sink(TestSink);
  }

  @effect
  setName(name: string) {
    this.testSink.setName(name);
  }

  @effect
  setProp(callback: (prop: number) => void) {
    callback(++this.value);
  }

  get state() {
    return this.testSink.state;
  }
}
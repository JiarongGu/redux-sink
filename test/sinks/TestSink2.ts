import { TestSink } from './TestSink';
import { sink, effect } from '../../src/decorators';

@sink('testSink2', TestSink)
export class TestSink2 {
  name: string = 'test';
  testSink: TestSink;
  value = 0;

  constructor(testSink: TestSink) {
    this.testSink = testSink;
  }

  @effect
  setName(name: string) {
    this.testSink.setName(name);
  }

  @effect
  directUpdateName(name: string) {
    this.testSink.state = {... this.testSink.state, name };
  }


  @effect
  setProp(callback: (prop: number) => void) {
    callback(++this.value);
  }

  get state() {
    return this.testSink.state;
  }
}
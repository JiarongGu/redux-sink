import { effect, sink } from '../../src/decorators';
import { TestSink } from './TestSink';

@sink('testSink2', TestSink)
export class TestSink2 {
  public name: string = 'test';
  public testSink: TestSink;
  public value = 0;

  constructor(testSink: TestSink) {
    this.testSink = testSink;
  }

  @effect
  public setName(name: string) {
    this.testSink.setName(name);
  }

  @effect
  public directUpdateName(name: string) {
    this.testSink.state = {... this.testSink.state, name };
  }

  @effect
  public setProp(callback: (prop: number) => void) {
    callback(++this.value);
  }

  get state() {
    return this.testSink.state;
  }
}

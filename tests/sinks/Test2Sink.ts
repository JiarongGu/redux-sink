import { TestSink } from './TestSink';
import { sink, effect } from '../../src/decorators';

@sink('test2Sink')
export class Test2Sink {
  name: string = 'test';
  
  testSink = new TestSink();
  value = 0;

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
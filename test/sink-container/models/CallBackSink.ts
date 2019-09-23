import { effect, sink } from '../../../src';

@sink('callback')
export class CallBackSink {
  public value: number = 0;

  @effect
  public callback(execute: (model: CallBackSink) => void) {
    execute(this);
  }
}

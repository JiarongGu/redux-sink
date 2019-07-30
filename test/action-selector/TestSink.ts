import { effect, sink, state } from '../../src';

@sink('test')
export class TestSink {
  @state public state = '';

  @effect
  public effect(value: string) {
    this.state = value;
  }

  public other() {
    // not used
  }
}

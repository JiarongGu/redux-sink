import { effect, sink, state } from '../../src';

@sink('injectable')
export class InjectableSink {
  @state public value = 'injectable';

  @effect
  public update(value: string) {
    this.value = value;
  }
}

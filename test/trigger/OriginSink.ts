import { effect, sink, state } from '../../src';

@sink('origin')
export class OriginSink {
  @state public value = 'origin';

  @effect
  public update1(value: string) {
    this.value = value;
  }

  @effect
  public update2(value: string) {
    this.value = value;
  }

  @effect
  public update3(value: string) {
    this.value = value;
  }

  @effect
  public update4(value1: string, value2: string) {
    // do nothing
  }
}

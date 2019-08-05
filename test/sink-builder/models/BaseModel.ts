import { sink, state, trigger } from '../../../src';

@sink('base')
export class BaseModel {
  @state public value = 10;
  @state public name = 'base';
  public reset = false;

  @trigger('base/value')
  public resetTrigger(value: number) {
    if (!this.reset) {
      this.reset = true;
      this.value = value;
      this.reset = false;
    }
  }
}

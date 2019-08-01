import { sink, state, trigger } from '../../../src';
import { OriginSink } from './OriginSink';

@sink('trigger', OriginSink)
export class NonLazyTriggerSink {
  @state public value = 'trigger';

  constructor(private origin: OriginSink) {}

  @trigger('origin/update1', { lazyLoad: false })
  public trigger1(value: string) {
    this.value = value;
  }
}

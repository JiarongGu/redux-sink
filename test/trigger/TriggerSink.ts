import { sink, SinkAction, state, trigger } from '../../src';
import { OriginSink } from './OriginSink';

@sink('trigger', OriginSink)
export class TriggerSink {
  @state public value = 'trigger';
  @state public originValue = 'trigger';

  constructor(private origin: OriginSink) {}

  @trigger('origin/update1')
  public trigger1(value: string) {
    this.value = value;
  }

  @trigger('origin/update2', { formatter: (value) => value + ' trigger' })
  public trigger2(value: string) {
    this.value = value;
  }

  @trigger('origin/update3', { rawAction: true })
  public trigger3(action: SinkAction) {
    this.value = action.type;
  }

  @trigger('origin/update4')
  public trigger4(value1: string, value2: string) {
    this.value = value1 + value2;
  }

  @trigger('origin/value')
  public trigger5(value: string) {
    this.originValue = value;
  }
}

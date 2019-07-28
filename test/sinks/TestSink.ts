import { effect, sink, state, trigger } from '../../src';

export interface TestState {
  name: string;
  value: string;
  copy: string;
}

@sink('testSink')
export class TestSink {
  @state
  public state = { name: '', value: '', copy: '' };

  @effect
  public setName(name: string) {
    this.state = ({ ...this.state, name });
  }

  @effect
  public setValue(value: string) {
    this.state = ({ ...this.state, value });
  }

  @effect
  public setCopy(copy: string) {
    this.state = ({ ...this.state, copy });
  }

  @effect
  public async setAll(name: string, value: string) {
    this.setName(name);
    this.setValue(value);
    return 'effect success';
  }

  public setNameOwnProps(name: string) {
    this.setCopy(name);
  }

  @trigger('testSink/setName')
  public trigger(name: string) {
    this.setNameOwnProps(name);
  }
}

import { sink, state, effect, trigger } from '../../src';

export class TestState {
  name: string = '';
  value: string = '';
  copy: string = '';
}

@sink('testSink')
export class TestSink {
  @state
  state = new TestState();

  @effect
  setName(name: string) {
    this.state = ({ ...this.state, name });
  }

  @effect
  setValue(value: string) {
    this.state = ({ ...this.state, value })
  }

  @effect
  setCopy(copy: string) {
    this.state = ({ ...this.state, copy })
  }

  @effect
  async setAll(name: string, value: string) {
    this.setName(name);
    this.setValue(value);
    return 'effect success';
  }

  setNameOwnProps(name: string) {
    this.setCopy(name);
  }

  @trigger('testSink/setName')
  trigger(name: string) {
    this.setNameOwnProps(name);
  }
}
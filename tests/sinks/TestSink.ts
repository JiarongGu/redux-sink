import { sink, state, reducer, effect, trigger } from '../../src';

export class TestState {
  name: string = '';
  value: string = '';
  copy: string = '';
}

@sink('testSink')
export class TestSink {
  @state
  state = new TestState();

  @reducer
  setName(name: string) {
    return ({ ...this.state, name })
  }

  @reducer
  setValue(value: string) {
    return ({ ...this.state, value })
  }

  @reducer
  setCopy(copy: string) {
    return ({ ...this.state, copy })
  }

  @effect
  async setAll(name: string, value: string) {
    this.setName(name);
    this.setValue(value);
    return 'effect success';
  }

  @trigger('testSink/setName')
  trigger(name: string) {
    this.setCopy(name);
  }
}
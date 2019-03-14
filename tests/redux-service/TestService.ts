import { sink, state, reducer, effect, trigger } from '../../src';

export class TestState {
  name: string = '';
  value: string = '';
  copy: string = '';
}

@sink('TestService')
export class TestService {
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

  @trigger('setName', TestService)
  trigger(name: string) {
    this.setCopy(name);
  }
}

@sink('Test2Service')
export class Test2Service {
  name: string = 'test';
  testService = new TestService();
  value = 0;

  @effect
  setName(name: string) {
    this.testService.setName(name);
  }

  @effect
  setProp(callback: (prop: number) => void) {
    callback(++this.value);
  }

  get state() {
    return this.testService.state;
  }
}
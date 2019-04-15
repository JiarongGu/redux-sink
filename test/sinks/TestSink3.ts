import { sink, state, effect } from '../../src';

@sink('testSink3')
export class TestSink3 {
  @state
  name = "new test sink 3 name";

  @effect
  setName(name: string) {
    this.name = name;
  }
}
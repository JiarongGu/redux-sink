import { sink, state, reducer, effect, trigger } from '../../src';

@sink('testSink3')
export class TestSink3 {
  @state
  name = "new test sink 3 name";

  @reducer
  setName(name: string) {
    return name
  }
}
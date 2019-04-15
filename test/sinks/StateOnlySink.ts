import { sink, state } from '../../src';

@sink('stateOnly')
export class StateOnlySink {
  @state
  firststate = 1;

  @state
  secondState = 2;
}
import { sink, state } from '../../src';

@sink('stateOnly')
export class StateOnlySink {
  @state
  onlystate = 1;
}
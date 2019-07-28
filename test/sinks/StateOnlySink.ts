import { sink, state } from '../../src';

@sink('stateOnly')
export class StateOnlySink {
  @state
  public firstState = 1;

  @state
  public secondState = 2;
}

import { sink, state } from '../../../src';
import { BaseModel } from './BaseModel';

@sink('inherited2')
export class InheritedModel2 extends BaseModel {
  @state public other = 'inherited';
  @state public name = 'inherited';
  @state public value = 5;
}

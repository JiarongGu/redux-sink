import { sink, state } from '../../../src';
import { BaseModel } from './BaseModel';

@sink('inherited')
export class InheritedModel extends BaseModel {
  @state public other = 'inherited';
  @state public name = 'inherited';
}

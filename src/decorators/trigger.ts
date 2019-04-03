
import { SinkBuilder } from '../SinkBuilder';
import { TriggerOptions } from '../typings';

/**
 * create trigger based on `action.type`, trigger function will take value on `action.payload`
 * @param {string} [action] 
 * type of the action for sink will be `{sink namespace}/{function name}`
 * @param {Object} [options={}] 
 * the trigger options object
 * @param {boolean} [options.fireOnInit] 
 * if set, trigger will be fired on initalize
 * @param {number} [options.priority] 
 * the priority for multiple trigger to run for the same action
 */
export function trigger(actionType: string, options?: TriggerOptions) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = SinkBuilder.get(target);
    sinkBuilder.triggers[actionType] = { handler: descriptor.value, actionType, options };
    return descriptor;
  }
}

import { SinkBuilder } from '../SinkBuilder';
import { TriggerOptions } from '../typings';

const defaultOptions: TriggerOptions = {
  lazyLoad: true,
  priority: 0,
  rawAction: false,
};

/**
 * create trigger based on `action.type`, trigger function will take value on `action.payload`
 * @param {string} [action]
 * type of the action for sink will be `{sink namespace}/{function name}`
 * @param {boolean} [options.lazyLoad]
 * default `true`, trigger will be fired on lazy load
 * @param {number} [options.priority]
 * default `0`, the priority for multiple trigger to run for the same action
 * @param {boolean} [options.rawAction]
 * default `false`, use the raw `action` as trigger function param instead of `action.payload`
 * @param {function} [options.formatter]
 * formatter use to preprocess the trigger function params
 */
export function trigger(actionType: string, options?: TriggerOptions) {
  const triggerOptions = Object.assign({}, defaultOptions, options);

  return function(target: any, name: string, descriptor: PropertyDescriptor) {
    const sinkBuilder = SinkBuilder.get(target);
    sinkBuilder.triggers.push({ handler: descriptor.value, actionType, options: triggerOptions });
    return descriptor;
  };
}
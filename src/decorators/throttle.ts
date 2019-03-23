import _throttle from 'lodash/throttle';
import { ThrottleOptions } from '../typings';

/**
 * Creates a throttled function that only invokes func at most once per every `wait` milliseconds
 * baed on lodash's throttled function https://lodash.com/docs/4.17.11#throttle
 * @param wait wait time
 * @param option throttle options
 */
export function throttle(wait: number, option?: ThrottleOptions) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _throttle(descriptor.value, wait, option);
  }
}
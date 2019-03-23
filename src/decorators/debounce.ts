import _debounce from 'lodash/debounce';
import { DebounceOptions } from '../typings';

/**
 * Creates a debounced function that delays until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked. 
 * baed on lodash's debounced function https://lodash.com/docs/4.17.11#debounce
 * @param wait wait time
 * @param option debounced options
 */
export function debounce(wait: number, option?: DebounceOptions) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _debounce(descriptor.value, wait, option);
  }
}
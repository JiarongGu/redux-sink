import { SinkContainer } from './SinkContainer';
import { createSinking } from './createSinking';

/**
 * default sink container for create store and bind sinks
 */
export const SinkFactory = new SinkContainer();

/**
 * connect sinks with component, only connect state, reducers and effects
 * @param sinks array args of sinks
 */
export const sinking = createSinking(SinkFactory);
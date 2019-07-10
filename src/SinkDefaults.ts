import { SinkContainer } from './SinkContainer';
import { createSinking } from './createSinking';
import { createSinkSelector } from './createSinkSelector';

/**
 * default sink container for create store and bind sinks
 */
export const SinkFactory = new SinkContainer();

/**
 * connect sinks with component, only connect state, reducers and effects
 * @param sinks array args of sink classes
 */
export const sinking = createSinking(SinkFactory);

/**
 * connect sink with using hook
 * @param sink sink class
 */
export const useSink = createSinkSelector(SinkFactory);
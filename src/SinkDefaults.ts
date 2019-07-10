import { SinkContainer } from './SinkContainer';
import { createSinking } from './createSinking';
import { createSinkSelector } from './createSinkSelector';


const __sinkFactory__ = new SinkContainer();

/**
 * default sink container for create store and bind sinks
 */
export const SinkFactory = __sinkFactory__;

/**
 * connect sinks with component, only connect state, reducers and effects
 * @param sinks array args of sink classes
 */
export const sinking = createSinking(__sinkFactory__);

/**
 * connect sink with using hook
 * @param sink sink class
 */
export const useSink = createSinkSelector(__sinkFactory__);
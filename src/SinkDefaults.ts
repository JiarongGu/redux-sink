import { createActionSelector } from './createActionSelector';
import { createSinking } from './createSinking';
import { createSinkSelector } from './createSinkSelector';
import { SinkContainer } from './SinkContainer';

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

/**
 * select action with sink and selector function
 * @param sink sink class
 * @param selector to select state of effect from sink
 */
export const selectAction = createActionSelector(__sinkFactory__);

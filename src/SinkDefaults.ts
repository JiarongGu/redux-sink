import { SinkContainer } from './SinkContainer';

const __sinkFactory__ = new SinkContainer();

/**
 * default sink container for create store and bind sinks
 */
export const SinkFactory = __sinkFactory__;

/**
 * Create store by sink configuration
 * @param {SinkConfiguration} config
 */
export const createStore = __sinkFactory__.createStore.bind(__sinkFactory__);

/**
 * invoke triggers by action
 * @param action sink action
 */
export const invokeTrigger = __sinkFactory__.invokeTrigger.bind(__sinkFactory__);

/**
 * invoke effect by action
 * @param action sink action
 */
export const invokeEffect = __sinkFactory__.invokeEffect.bind(__sinkFactory__);

/**
 * Get traced effect tasks
 * @returns {[Promise]} promise array
 */
export const getEffectTasks = __sinkFactory__.getEffectTasks.bind(__sinkFactory__);

/**
 * Get sink instance by sink class
 * @param sink Sink class
 * @returns Sink instance
 */
export const getSink = __sinkFactory__.getSink.bind(__sinkFactory__);

import { AnyFunction, SinkAction, TriggerEventHandler, TriggerOptions } from '../typings';

/**
 * Singleton service class used on trigger middleware, manages action and trigger events
 */
export class TriggerService {
  // stage actions logs each action comes to the redux
  // used for trigger that might be lazy loaded
  public stagedActions: { [key: string]: any } = {};

  // collection of trigger that grouped by action keys
  public triggerMap = new Map<string, Array<TriggerEventHandler>>();

  /**
   * Add trigger to trigger
   * @param actionType the action type that trigger hooks on
   * @param handler the handler function for trigger
   * @param options trigger options
   * @param options.priority priority when multiple trigger runs together, default 0
   * @param options.lazyLoad if trigger loaded after the action, it can also be fired, default true
   * @param options.rawAction pass the full action to trigger function instead of only payload, default false
   * @param options.formatter pre-formatter for the value pass down to trigger function
   */
  public addTrigger(actionType: string, handler: AnyFunction, options: TriggerOptions) {
    const { priority = 0, lazyLoad } = options;

    let handlers = this.triggerMap.get(actionType);
    if (!handlers) {
      this.triggerMap.set(actionType, handlers = []);
    }

    handlers.push({ handler, priority });

    if (priority > 0) {
      handlers.sort((a, b) => b.priority - a.priority);
    }

    if (lazyLoad && this.stagedActions[actionType]) {
      const action = this.stagedActions[actionType];
      handler(action);
    }
  }

  /**
   * activate trigger directly, can be useful for server-side-rendering
   * @param action sink action
   * @returns {Promise} promise of result that triggers returns, in order of trigger priority
   */
  public activateTrigger(action: SinkAction): Promise<any> {
    if (!action.type) {
      return Promise.resolve([]);
    }

    // stage each action for lazy loaded triggers
    this.stagedActions[action.type] = action;

    // try get trigger
    const triggers = this.triggerMap.get(action.type);

    if (triggers) {
      const tasks = triggers.map(trigger => trigger.handler(action));
      return Promise.all(tasks);
    }
    return Promise.resolve([]);
  }
}

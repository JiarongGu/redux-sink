import {
  AnyFunction,
  MiddlewareService,
  MiddlewareServiceResult,
  SinkAction,
  TriggerEventHandler,
  TriggerOptions
} from '../typings';

/**
 * Singleton service class used on trigger middleware, manages action and trigger events
 */
export class TriggerService implements MiddlewareService {
  // stage actions logs each action comes to the redux
  // used for trigger that might be lazy loaded
  public stagedActions: { [key: string]: any } = {};

  // collection of trigger that grouped by action keys
  public eventsMap = new Map<string, Array<TriggerEventHandler>>();

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

    let handlers = this.eventsMap.get(actionType);
    if (!handlers) {
      this.eventsMap.set(actionType, handlers = []);
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
   * invoke trigger directly, can be useful for server-side-rendering
   * @param action sink action
   * @returns {Promise} promise of result that triggers returns, in order of trigger priority
   */
  public invoke(action: SinkAction): MiddlewareServiceResult {
    if (!action.type) {
      return { value: Promise.resolve() };
    }
    // stage each action for lazy loaded triggers
    this.stagedActions[action.type] = action;

    // try get trigger events
    const events = this.eventsMap.get(action.type);
    if (events) {
      const tasks = events.map(event => event.handler(action));
      return { value: Promise.all(tasks) };
    }
    return { value: Promise.resolve() };
  }
}

import { AnyFunction, SinkAction, TriggerEventHandler, TriggerOptions } from '../typings';

export class TriggerService {
  public stagedActions: { [key: string]: any } = {};
  public triggerHandlers = new Map<string, Array<TriggerEventHandler>>();

  public addTrigger(actionType: string, handler: AnyFunction, options: TriggerOptions) {
    const { priority = 0, lazyLoad } = options;

    let handlers = this.triggerHandlers.get(actionType);
    if (!handlers) {
      this.triggerHandlers.set(actionType, handlers = []);
    }

    handlers.push({ handler, priority });

    if (priority > 0) {
      handlers.sort((a, b) => b.priority - a.priority);
    }

    if (lazyLoad && this.stagedActions[actionType] !== undefined) {
      const action = this.stagedActions[actionType];
      handler(action);
    }
  }

  public activeTrigger(action: SinkAction) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers) {
      const tasks = triggers.map(trigger => trigger.handler(action));
      return Promise.all(tasks);
    }
    return Promise.resolve([]);
  }
}

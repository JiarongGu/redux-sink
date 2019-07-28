import { SinkAction, TriggerHandler, TriggerOptions } from '../typings';

export class TriggerService {
  public stagedActions: { [key: string]: any } = {};

  private triggerHandlers = new Map<string, Array<{ priority: number, handler: TriggerHandler }>>();

  public addTrigger(actionType: string, handler: TriggerHandler, options?: TriggerOptions) {
    let handlers = this.triggerHandlers.get(actionType);
    if (!handlers) {
      this.triggerHandlers.set(actionType, handlers = []);
    }
    const priority = options && options.priority || 0;
    let fireOnInit = options && options.fireOnInit;

    // default fireOnInit to true
    if (fireOnInit === undefined) {
      fireOnInit = true;
    }

    handlers.push({ handler, priority });

    if (priority > 0) {
      handlers.sort((a, b) => b.priority - a.priority);
    }

    if (fireOnInit && this.stagedActions[actionType] !== undefined) {
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

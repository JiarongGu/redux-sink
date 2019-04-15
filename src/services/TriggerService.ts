import { TriggerHandler, TriggerOptions } from '../typings';
import { Action } from 'redux';

export class TriggerService {
  triggerHandlers = new Map<string, Array<{ priority: number, handler: TriggerHandler }>>();
  stagedActions: { [key: string]: any } = {};

  addTrigger(actionType: string, handler: TriggerHandler, options?: TriggerOptions) {
    let handlers = this.triggerHandlers.get(actionType);
    if (!handlers) {
      this.triggerHandlers.set(actionType, handlers = []);
    }
    const priority = options && options.priority || 0;
    const fireOnInit = options && options.fireOnInit;

    handlers.push({ handler, priority });

    if (priority > 0)
      handlers.sort((a, b) => b.priority - a.priority);

    if (fireOnInit && this.stagedActions[actionType] !== undefined) {
      const action = this.stagedActions[actionType];
      handler(action);
    }
  }

  activeTrigger(action: Action) {
    const triggers = this.triggerHandlers.get(action.type);
    if (triggers) {
      const tasks = triggers.map(trigger => trigger.handler(action));
      return Promise.all(tasks);
    }
    return Promise.resolve([]);
  }
}
import { EffectHandler, IMiddlewareService, SinkAction } from '../typings';

export class EffectService implements IMiddlewareService {
  public effectHandlers = new Map<string, EffectHandler>();
  public effectTasks: Array<Promise<any>> = [];
  public effectTrace: boolean = false;

  constructor() {
    this.removeEffectTask = this.removeEffectTask.bind(this);
  }

  public invoke(action: SinkAction): Promise<any> {
    if (action.type && action.payload) {
      const handler = this.effectHandlers.get(action.type);

      if (handler) {
        const task = handler(action.payload);

        // if task is promise
        if (task && task.then) {
          if (this.effectTrace) {
            this.addEffectTask(task);
          }
          return task as Promise<any>;
        }
        return Promise.resolve(task);
      }
    }
    return Promise.resolve();
  }

  public addEffect(action: string, handler: EffectHandler) {
    this.effectHandlers.set(action, handler);
  }

  public addEffectTask(task: Promise<any>) {
    this.effectTasks.push(task.then((response: any) => {
      this.removeEffectTask(task);
      return response;
    }).catch((reason) => {
      this.removeEffectTask(task);
      return reason;
    }));
  }

  public removeEffectTask(task: Promise<any>) {
    this.effectTasks.splice(this.effectTasks.indexOf(task), 1);
  }
}

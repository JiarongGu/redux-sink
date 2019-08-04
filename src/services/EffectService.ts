import { EffectHandler, IMiddlewareService, SinkAction } from '../typings';

export class EffectService implements IMiddlewareService {
  public effectHandlers = new Map<string, EffectHandler>();

  public tasks: Array<Promise<any>> = [];
  public enableTrace: boolean = false;

  constructor() {
    this.removeTask = this.removeTask.bind(this);
  }

  public invoke(action: SinkAction): Promise<any> {
    if (action.type) {
      const handler = this.effectHandlers.get(action.type);
      if (handler) {
        const task = handler(action.payload);
        if (task && task.then) {
          // if task is promise
          if (this.enableTrace) {
            this.addTask(task);
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

  private addTask(task: Promise<any>) {
    this.tasks.push(task
      .then((response) => {
        this.removeTask(task);
        return response;
      })
      .catch((reason) => {
        // should be handled by effect function
        // this catch should not be used
        this.removeTask(task);
        throw reason;
      })
    );
  }

  private removeTask(task: Promise<any>) {
    this.tasks.splice(this.tasks.indexOf(task), 1);
  }
}

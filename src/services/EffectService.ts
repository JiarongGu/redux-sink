import { EffectHandler, IMiddlewareService, SinkAction } from '../typings';

export class EffectService implements IMiddlewareService {
  public effectHandlers = new Map<string, EffectHandler>();

  public tasks: Array<Promise<any>> = [];
  public enableTrace: boolean = false;

  public invoke(action: SinkAction): Promise<any> {
    if (action.type) {
      const handler = this.effectHandlers.get(action.type);
      if (handler) {
        const task = handler(action.payload);
        if (this.enableTrace && task && task.then) {
          return this.addTask(task);
        }
        return Promise.resolve(task);
      }
    }
    return Promise.resolve();
  }

  public addEffect(action: string, handler: EffectHandler) {
    this.effectHandlers.set(action, handler);
  }

  private addTask(task: Promise<any>): Promise<any> {
    const traceTask = task
      .then((response) => {
        this.removeTask(task);
        return response;
      })
      .catch((reason) => {
        this.removeTask(task);
        throw reason;
      });
    this.tasks.push(traceTask);
    return traceTask;
  }

  private removeTask(task: Promise<any>) {
    this.tasks.splice(this.tasks.indexOf(task), 1);
  }
}

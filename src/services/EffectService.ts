import { EffectHandler, MiddlewareService, MiddlewareServiceResult, SinkAction } from '../typings';

export class EffectService implements MiddlewareService {
  public effectHandlers = new Map<string, EffectHandler>();

  public tasks: Array<Promise<any>> = [];
  public enableTrace: boolean = false;

  public invoke(action: SinkAction): MiddlewareServiceResult {
    if (action.type) {
      const handler = this.effectHandlers.get(action.type);
      if (handler) {
        const task = handler(action.payload);
        const result = { isMiddlewareResult: true } as MiddlewareServiceResult;

        if (this.enableTrace && task && typeof task.then === 'function') {
          result.value = this.addTask(task);
        } else {
          result.value = Promise.resolve(task);
        }
        return result;
      }
    }
    return { value: Promise.resolve() };
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
        // should be handled by effect function
        // this catch should not be used
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

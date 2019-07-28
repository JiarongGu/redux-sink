import { EffectHandler } from '../typings';

export class EffectService {
  public effectHandlers = new Map<string, EffectHandler>();
  public effectTasks: Array<Promise<any>> = [];

  constructor() {
    this.removeEffectTask = this.removeEffectTask.bind(this);
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

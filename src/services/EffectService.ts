import { EffectHandler } from '../typings';

export class EffectService {
  effectHandlers = new Map<string, EffectHandler>();
  effectTasks: Array<Promise<any>> = [];

  constructor() {
    this.removeEffectTask = this.removeEffectTask.bind(this);
  }

  addEffect(action: string, handler: EffectHandler) {
    this.effectHandlers.set(action, handler);
  }

  addEffectTask(task: Promise<any>) {
    this.effectTasks.push(task.then((response: any) => {
      this.removeEffectTask(task);
      return response;
    }).catch((reason) => {
      this.removeEffectTask(task);
      return reason;
    }));
  }

  removeEffectTask(task: Promise<any>) {
    this.effectTasks.splice(this.effectTasks.indexOf(task), 1);
  }
}
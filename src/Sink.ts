import { Store } from 'redux';
import { EffectHandler, ReduceHandler, SinkAction, SinkDispatch, TriggerEvent } from './typings';

export class Sink {
  public state?: any;
  public getStore: () => Store | undefined;

  // configured by decorator
  public namespace!: string;
  public reducers: { [key: string]: ReduceHandler };
  public effects: { [key: string]: EffectHandler };
  public triggers: Array<TriggerEvent>;

  public instance: any;

  // auto generated
  private _dispatches?: { [key: string]: SinkDispatch };
  private _actions?: { [key: string]: string };

  constructor(getStore: () => Store | undefined) {
    this.reducers = {};
    this.effects = {};
    this.instance = {};
    this.triggers = [];
    this.getStore = getStore;
  }

  public setState(state: any) {
    this.state = state;
  }

  public dispatch(name: string, payload: any, effect: boolean) {
    const store = this.getStore();
    return store && store.dispatch({
      effect,
      payload,
      type: this.actions[name]
    } as SinkAction);
  }

  public get actions() {
    if (!this._actions) {
      const reducers = Object.keys(this.reducers);
      const effects = Object.keys(this.effects);
      this._actions = [...reducers, ...effects]
        .reduce((accumulate, current) => (
          accumulate[current] = `${this.namespace}/${current}`, accumulate
        ), {} as { [key: string]: any });
    }
    return this._actions;
  }

  public get dispatches() {
    if (!this._dispatches) {
      this._dispatches = Object.keys(this.actions).reduce((accumulate, key) => {
        accumulate[key] = (...args: Array<any>) => this.dispatch(key, args, true);
        return accumulate;
      }, {});
    }
    return this._dispatches;
  }
}

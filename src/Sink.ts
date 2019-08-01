import { Store } from 'redux';
import { EffectHandler, ReducerHandler, SinkAction, SinkDispatch, TriggerEvent } from './typings';

export class Sink {
  public state?: any;
  public getStore: () => Store | undefined;

  // configured by decorator
  public namespace!: string;
  public reducers: { [key: string]: ReducerHandler };
  public effects: { [key: string]: EffectHandler };
  public triggers: Array<TriggerEvent>;

  public instance: any;

  // auto generated
  private _dispatches?: { [key: string]: SinkDispatch };
  private _reducerActions?: { [key: string]: string };
  private _effectActions?: { [key: string]: string };
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

  public dispatch(name: string, payload: any, effect: boolean): SinkAction | undefined {
    const store = this.getStore();
    const type = this.actions[name];
    return store && store.dispatch({ effect, payload, type });
  }

  public get reducerActions() {
    if (!this._reducerActions) {
      this._reducerActions = this.getAction(Object.keys(this.reducers), this.namespace);
    }
    return this._reducerActions!;
  }

  public get effectActions() {
    if (!this._effectActions) {
      this._effectActions = this.getAction(Object.keys(this.effects), this.namespace);
    }
    return this._effectActions!;
  }

  public get actions() {
    if (!this._actions) {
      this._actions = Object.assign({}, this.effectActions, this.reducerActions);
    }
    return this._actions!;
  }

  public get dispatches() {
    if (!this._dispatches) {
      const reducerDispatches = this.getReducerDispatches(Object.keys(this.reducerActions));
      const effectDispatches = this.getEffectDispatches(Object.keys(this.effectActions));
      this._dispatches = Object.assign({}, reducerDispatches, effectDispatches);
    }
    return this._dispatches!;
  }

  private getAction(keys: Array<string>, namespace: string) {
    return keys.reduce((accumulate, current) => (
      accumulate[current] = `${namespace}/${current}`, accumulate
    ), {} as { [key: string]: any });
  }

  private getReducerDispatches(keys: Array<string>) {
    return keys.reduce((dispatches, key) => (
      dispatches[key] = (value: any) => this.dispatch(key, value, false), dispatches
    ), {} as any);
  }

  private getEffectDispatches(keys: Array<string>) {
    return keys.reduce((dispatches, key) => (
      dispatches[key] = (...args: Array<any>) => this.dispatch(key, args, true), dispatches
    ), {} as any);
  }
}

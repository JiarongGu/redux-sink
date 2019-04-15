import { EffectHandler, TriggerEvent, ReduceHandler } from './typings';
import { Store } from 'redux';

export class Sink {
  state?: any;
  getStore: () => Store | undefined;

  // configured by decorator
  namespace!: string;
  reducers: { [key: string]: ReduceHandler };
  effects: { [key: string]: EffectHandler };
  triggers: Array<TriggerEvent>;

  // auto generated
  _dispatches?: { [key: string]: Function };
  _actions?: { [key: string]: string };

  instance: any;

  constructor(getStore: () => Store | undefined) {
    this.reducers = {};
    this.effects = {};
    this.instance = {};
    this.triggers = [];
    this.getStore = getStore;
  }

  setState(state: any) {
    this.state = state
  }

  dispatch(name: string) {
    const store = this.getStore();
    return (payload: Array<any>) => store && store.dispatch({
      type: this.actions[name],
      payload: payload,
      fromSink: true,
    });
  }

  get actions() {
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

  get dispatches() {
    if (!this._dispatches) {
      this._dispatches = Object.keys(this.actions).reduce((accumulate: any, key) => {
        const dispatch = this.dispatch(key);
        accumulate[key] = function () {
          dispatch(Array.from(arguments));
        };
        return accumulate;
      }, {});
    }
    return this._dispatches;
  }
}
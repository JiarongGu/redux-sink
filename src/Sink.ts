import { PayloadHandler, TriggerEvent } from './typings';
import { Store } from 'redux';

export class Sink {
  state?: any;

  // configured by decorator
  namespace!: string;
  stateProperty?: string;
  reducers: { [key: string]: PayloadHandler };
  effects: { [key: string]: PayloadHandler };
  triggers: Array<TriggerEvent>;

  // auto generated
  _dispatches?: { [key: string]: Function };
  _actions?: { [key: string]: string };

  instance: any;

  constructor() {
    this.reducers = {};
    this.effects = {};
    this.instance = {};
    this.triggers = [];
  }
  
  // configured by SinkContainer
  getStore?: () => Store | undefined;
  
  setState(state: any) {
    this.state = state
  }
  
  dispatch(name: string) {
    const store = this.getStore && this.getStore();
    const dispatch = store && store.dispatch;
    return (payload: Array<any>) => dispatch && dispatch({
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
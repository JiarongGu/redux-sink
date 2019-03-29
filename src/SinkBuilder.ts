
import { TriggerEvent, PayloadHandler, Action, ISinkFactory } from './typings';
import { Store } from 'redux';

export class SinkBuilder {
  sinkPrototype: any;
  store?: Store;

  state?: any;

  // basic reducer config
  namespace!: string;
  stateProperty?: string;
  reducers: { [key: string]: PayloadHandler };
  effects: { [key: string]: PayloadHandler };

  // triggers and reloaders
  triggers: { [key: string]: TriggerEvent };
  reloaders: { [key: string]: string };

  _dispatches?: { [key: string]: Function };
  _actions?: { [key: string]: string };

  built: boolean;

  constructor(sink: any) {
    this.reducers = {};
    this.effects = {};

    this.triggers = {};
    this.reloaders = {};

    this.built = false;
    this.sinkPrototype = sink;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype.__sinkBuilder__) {
      prototype.__sinkBuilder__ = new SinkBuilder(prototype);
    }
    return prototype.__sinkBuilder__;
  }
  
  setState(state: any) {
    this.state = state
  };

  build(factory: ISinkFactory) {
    if (this.built)
      return;
    
    // set store from factory
    this.store = factory.store;

    // update state if there is preloaded from store
    if (this.store) {
      const storeState = this.store.getState();
      const preloadedState = storeState && storeState[this.namespace];
      if (preloadedState !== undefined) {
        this.state = preloadedState
      }
    }

    factory.addSink(this);
    
    this.built = true;
  }

  get actions() {
    if (!this._actions)
    {
      const reducers = Object.keys(this.reducers);
      const effects = Object.keys(this.effects);
      this._actions = [...reducers, ...effects]
        .reduce((accumulate, current) => (
          accumulate[current] = `${this.namespace}/${current}`, accumulate
        ), {});
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

  apply(instance: any) {
    const properties = Object.keys(instance);
    const prototype = this.sinkPrototype;

    if (!prototype.__sinkApplied__) {
      // set default prototype values
      properties.forEach((key) => {
        prototype[key] = instance[key];
      });

      // match the prototype state to sink state
      if (this.stateProperty) {
        this.state = instance[this.stateProperty];

        Object.defineProperty(prototype, this.stateProperty, {
          get: () => this.state,
          set: (value) => { this.state = value }
        });
      }
      prototype.__sinkApplied__ = true;
    }

    // remove all properties, so we only get them from prototype
    properties.forEach((key) => {
      delete instance[key]
    });
  }

  dispatch(name: string) {
    const dispatch = this.store && this.store.dispatch;
    return (payload: Array<any>) => dispatch && dispatch({
      type: this.actions[name],
      payload: payload
    });
  }
}
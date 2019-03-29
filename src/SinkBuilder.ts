
import { TriggerEvent, PayloadHandler, Action, ISinkFactory } from './typings';
import { Store } from 'redux';

const ignoredProperties = ['constructor', '__sinkBuilder__'];

export class SinkBuilder {
  __sinkPrototype___: any;
  __store__?: Store;

  state?: any;

  // basic reducer config
  namespace!: string;
  stateProperty?: string;
  reducers: { [key: string]: PayloadHandler };
  effects: { [key: string]: PayloadHandler };

  // handlers and actions
  actions: { [key: string]: string };

  // triggers and reloaders
  triggers: { [key: string]: TriggerEvent };
  reloaders: { [key: string]: string };

  dispatches: { [key: string]: Function };

  built: boolean;

  constructor(sink: any) {
    this.reducers = {};
    this.effects = {};

    this.triggers = {};
    this.reloaders = {};

    this.actions = {};

    this.dispatches = {};

    this.built = false;
    this.__sinkPrototype___ = sink;
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
    this.__store__ = factory.store;

    // update state if there is preloaded from store
    if (this.__store__) {
      const storeState = this.__store__.getState();
      const preloadedState = storeState && storeState[this.namespace];
      if (preloadedState !== undefined) {
        this.state = preloadedState
      }
    }

    // add all action events
    Object.keys(this.reducers).forEach(key => {
      this.actions[key] = `${this.namespace}/${key}`;
    });

    Object.keys(this.effects).forEach(key => {
      this.actions[key] = `${this.namespace}/${key}`;
    });

    factory.addSink(this);

    // form dispatch collection
    this.dispatches = Object.keys(this.actions).reduce((accumulate: any, key) => {
      const dispatch = this.dispatch(key);
      accumulate[key] = function () {
        dispatch(Array.from(arguments));
      };
      return accumulate;
    }, {});
    
    this.built = true;
  }

  apply(instance: any) {
    const properties = Object.keys(instance);
    const prototype = this.__sinkPrototype___;

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
    const dispatch = this.__store__ && this.__store__.dispatch;
    return (payload: Array<any>) => dispatch && dispatch({
      type: this.actions[name],
      payload: payload
    });
  }
}
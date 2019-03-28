
import { TriggerEvent, PayloadHandler, Action, ISinkFactory } from './typings';
import { ensureSinkBuilt } from './ensureSinksBuilt';

export class SinkBuilder {
  __sinkPrototype___: any;
  __state__?: any;
  __dispatch__?: any;

  // basic reducer config
  namespace!: string;
  sinkState?: any;
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

  build(factory: ISinkFactory) {
    if (this.built)
      return;
    // set dispatch from factory
    this.__dispatch__ = (action: any) => factory.store && factory.store.dispatch(action);

    // create reducer if there is state and reducers
    const reducerKeys = Object.keys(this.reducers);
    if (this.stateProperty && reducerKeys.length > 0) {
      const storeState = factory.store && factory.store.getState();
      const sinkState = storeState && storeState[this.namespace] || this.sinkState;
      const preloadedState = sinkState === undefined ? null : sinkState;
      this.__state__ = preloadedState;

      const sinkStateUpdater = (state: any) => {
        this.__state__ = state
      };

      const mergedReducers: { [key: string]: PayloadHandler } = {};

      reducerKeys.forEach(key => {
        this.actions[key] = `${this.namespace}/${key}`;
        mergedReducers[this.actions[key]] = this.reducers[key];
      });

      const reducer = combineReducer(preloadedState, mergedReducers);
      factory.addReducer(this.namespace, reducer, sinkStateUpdater);
    }

    // register effects
    Object.keys(this.effects).forEach(key => {
      this.actions[key] = `${this.namespace}/${key}`;
      factory.addEffect(this.actions[key], this.effects[key]);
    });

    // added reloadable action
    Object.keys(this.reloaders).forEach(key => {
      factory.addReloader(this.actions[this.reloaders[key]], null);
    })

    // register subscribe
    Object.keys(this.triggers).forEach(key => {
      const trigger = this.triggers[key];
      if (trigger.sink) 
        ensureSinkBuilt(trigger.sink);
      
      factory.addTrigger(trigger.action, trigger.handler, trigger.priority);
    });

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
        this.sinkState = instance[this.stateProperty];

        Object.defineProperty(prototype, this.stateProperty, {
          get: () => this.__state__,
          set: (value) => { this.__state__ = value }
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
    const dispatch = this.__dispatch__;
    return (payload: Array<any>) => dispatch && dispatch({
      type: this.actions[name],
      payload: payload
    });
  }
}

function combineReducer(preloadedState: any, reducers: { [key: string]: PayloadHandler }) {
  return function (state: any, action: Action) {
    const reducer = reducers[action.type];
    if (reducer)
      return reducer(action.payload);
    return state === undefined ? preloadedState : state;
  }
}
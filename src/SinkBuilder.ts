
import { TriggerEvent, PayloadHandler, Action, ISinkFactory } from './typings';

export class SinkBuilder {
  _state?: any;
  _dispatch?: any;
  
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

  dispatches: { [key:string]: Function };

  built: boolean;

  constructor() {
    this.reducers = {};
    this.effects = {};

    this.triggers = {};
    this.reloaders = {};

    this.actions = {};

    this.dispatches = {};

    this.built = false;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype._sinkBuilder) {
      prototype._sinkBuilder = new SinkBuilder();
    }
    return prototype._sinkBuilder;
  }

  build(factory: ISinkFactory, instance: any) {
    if (this.built)
      return;

    // set dispatch from factory
    this._dispatch = (action: any) => factory.store && factory.store.dispatch(action);
    
    // create reducer if there is state and reducers
    const reducerKeys = Object.keys(this.reducers);
    if (this.stateProperty && reducerKeys.length > 0) {
      const currentState = factory.store && factory.store.getState();
      const sinkState = currentState && currentState[this.namespace] || instance[this.stateProperty];
      const preloadedState = sinkState === undefined ? null : sinkState;

      this._state = preloadedState;
      const sinkStateUpdater = (state: any) => {
        this._state = state
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

  apply(prototype: any, instance: any) {
    const properties = Object.keys(instance);
    
    if (!prototype._sinkApplied) {
      // set default prototype values
      properties.forEach((key) => {
        prototype[key] = instance[key];
      });

      // match the prototype state to sink state
      if (this.stateProperty) {
        Object.defineProperty(prototype, this.stateProperty, {
          set: (value) => { this._state = value },
          get: () => this._state
        });
      }
      prototype._sinkApplied = true;
    }

    // remove all properties, so we only get them from prototype
    properties.forEach((key) => {
      delete instance[key]
    });
  }

  dispatch(name: string) {
    const dispatch = this._dispatch;
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
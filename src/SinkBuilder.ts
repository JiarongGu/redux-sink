
import { ActionFunction, TriggerEvent, PayloadHandler, Action, ISinkFactory } from './typings';

export class SinkBuilder {
  _state?: any;
  _dispatch?: any;
  
  // basic reducer config
  namespace!: string;
  stateProperty?: string;
  reducers: { [key: string]: PayloadHandler };
  effects: { [key: string]: PayloadHandler };

  // inital value of the sink
  properties: { [key: string]: any };

  // handlers and actions
  actions: { [key: string]: string };
  actionFunctions: { [key: string]: ActionFunction };

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

    this.actionFunctions = {};
    this.properties = {};

    this.dispatches = {};

    this.built = false;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype._sinkBuilder) {
      prototype._sinkBuilder = new SinkBuilder();
    }
    return prototype._sinkBuilder;
  }

  build(factory: ISinkFactory) {
    if (this.built)
      return;

    // set dispatch from factory
    this._dispatch = (action: any) => factory.store && factory.store.dispatch(action);
    
    // create reducer if there is state and reducers
    const reducerKeys = Object.keys(this.reducers);
    if (this.stateProperty && reducerKeys.length > 0) {
      const currentState = factory.store && factory.store.getState();
      const sinkState = currentState && currentState[this.namespace] || this.properties[this.stateProperty];
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
    // apply all properties to prototype only once
    if (!prototype._sinkApplied) {
      // get properties from first instance
      this.properties = Object.keys(instance).reduce((properties: any, key) => {
        properties[key] = instance[key];
        return properties;
      }, {});

      // set default prototype values
      Object.keys(this.properties).forEach((key) => {
        prototype[key] = this.properties[key];
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
    Object.keys(this.properties).forEach((key) => {
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
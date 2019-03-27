
import { ActionFunction, TriggerEvent, PayloadHandler, Action, ISinkFacotry } from './typings';
import { SinkFactory } from './SinkFactory';

export class SinkBuilder {
  _state?: any;
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
  triggers: Array<TriggerEvent>;
  reloaders: Array<string>;

  // build status
  built: boolean;
  applied: boolean;
  
  // factory that can be replaced
  factory: ISinkFacotry;

  constructor() {
    this.reducers = {};
    this.effects = {};

    this.triggers = [];
    this.reloaders = [];

    this.actions = {};

    this.actionFunctions = {};
    this.properties = {};
    this.built = false;
    this.applied = false;
    this.factory = SinkFactory;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype._sinkBuilder) {
      prototype._sinkBuilder = new SinkBuilder();
    }
    return prototype._sinkBuilder;
  }

  static build(prototype: any) {
    const builder = SinkBuilder.get(prototype);
    if (builder.built) 
      return;
    
    const factory = builder.factory;
    const namespace = builder.namespace;
    const actions = builder.actions;
    const reducers = builder.reducers;
    const effects = builder.effects;
    const reloaders = builder.reloaders;
    const triggers = builder.triggers;

    // create reducer if there is state and reducers
    const reducerKeys = Object.keys(builder.reducers);
    if (builder.stateProperty && reducerKeys.length > 0) {
      const currentState = factory.store && factory.store.getState();
      const sinkState = currentState && currentState[namespace] || builder.properties[builder.stateProperty];
      const preloadedState = sinkState === undefined ? null : sinkState;

      builder._state = preloadedState;
      const sinkStateUpdater = (state: any) => {
        builder._state = state
      };

      const mergedReducers: { [key: string]: PayloadHandler } = {};

      reducerKeys.forEach(key => {
        actions[key] = `${namespace}/${key}`;
        mergedReducers[actions[key]] = reducers[key];
      });

      const reducer = combineReducer(preloadedState, mergedReducers);
      factory.addReducer(namespace, reducer, sinkStateUpdater);
    }

    // register effects
    Object.keys(effects).forEach(key => {
      actions[key] = `${namespace}/${key}`;
      factory.addEffect(actions[key], effects[key]);
    });

    // added reloadable action
    reloaders.forEach(reloader => {
      factory.addReloader(actions[reloader], null);
    })

    // register subscribe
    triggers.forEach(trigger => {
      factory.addTrigger(trigger.action, trigger.handler, trigger.priority);
    });

    builder.built = true;
  }

  apply(prototype: any, instance: any) {
    // apply all properties to prototype only once
    if (!this.applied) {
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
      this.applied = true;
    }

    // remove all properties, so we only get them from prototype
    Object.keys(this.properties).forEach((key) => {
      delete instance[key]
    });
  }

  dispatch(name: string) {
    const dispatch = this.factory.store && this.factory.store.dispatch;
    return (payload: Array<any>) => dispatch && dispatch({
      type: this.actions[name],
      payload: payload
    });
  }

  get dispatches() {
    return Object.keys(this.actions).reduce((accumulate: any, key) => {
      const dispatch = this.dispatch(key);
      accumulate[key] = function () {
        dispatch(Array.from(arguments));
      };
      return accumulate;
    }, {});
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
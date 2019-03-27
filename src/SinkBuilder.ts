
import { ActionFunction, TriggerEvent, PayloadHandler, Action, ISinkFacotry } from './typings';
import { SinkFactory } from './SinkFactory';

export class SinkBuilder {
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

  built: boolean;
  applied: boolean;

  _state?: any;
  _factory: ISinkFacotry;

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
    this._factory = SinkFactory;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype._sinkBuilder) {
      prototype._sinkBuilder = new SinkBuilder();
    }
    return prototype._sinkBuilder;
  }

  build() {
    if (this.built) 
      return;

    // create reducer if there is state and reducers
    const reducerKeys = Object.keys(this.reducers);
    if (this.stateProperty && reducerKeys.length > 0) {
      const currentState = this._factory.store && this._factory.store.getState();
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

      this._factory.addReducer(this.namespace, reducer, sinkStateUpdater);
    }

    // register effects
    Object.keys(this.effects).forEach(key => {
      this.actions[key] = `${this.namespace}/${key}`;
      this._factory.addEffect(this.actions[key], this.effects[key]);
    });

    // added reloadable action
    this.reloaders.forEach(reloader => {
      this._factory.addReloader(this.actions[reloader], null);
    })

    // register subscribe
    this.triggers.forEach(trigger => {
      this._factory.addTrigger(trigger.action, trigger.handler, trigger.priority);
    });

    this.built = true;
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
    const dispatch = this._factory.store && this._factory.store.dispatch;
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
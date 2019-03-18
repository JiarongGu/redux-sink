
import { ActionFunction, TriggerEvent, PayloadHandler, Action } from './typings';
import { registerEffect, registerTrigger, registerReloader } from './middlewares';
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

  constructor() {
    this.reducers = {};
    this.effects = {};

    this.triggers = [];
    this.reloaders = [];

    this.actions = {};

    this.actionFunctions = {};
    this.properties = {};
    this.built = false;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype._sinkBuilder) {
      prototype._sinkBuilder = new SinkBuilder();
    }
    return prototype._sinkBuilder;
  }

  build(namespace: string, prototype: any) {
    if (this.built)
      return;

    this.namespace = namespace;

    // set default prototype values
    Object.keys(this.properties).forEach((key) => {
      prototype[key] = this.properties[key];
    });

    const reducerKeys = Object.keys(this.reducers);

    // create reducer if there is state and reducers
    if (this.stateProperty && reducerKeys.length > 0) {
      const currentState = SinkFactory.store && SinkFactory.store.getState();
      const sinkState = currentState && currentState[namespace] || this.properties[this.stateProperty];
      const preloadedState = sinkState === undefined ? null : sinkState;

      // match the prototype state to preloadedState
      prototype[this.stateProperty] = preloadedState;

      const sinkStateUpdater = (state: any) => {
        prototype[this.stateProperty!] = state
      };

      const mergedReducers = {};

      reducerKeys.forEach(key => {
        this.actions[key] = `${this.namespace}/${key}`;
        mergedReducers[this.actions[key]] = this.reducers[key];
      });

      const reducer = combineReducer(preloadedState, mergedReducers);

      SinkFactory.addReducer(namespace, reducer, sinkStateUpdater);
    }

    // register effects
    Object.keys(this.effects).forEach(key => {
      this.actions[key] = `${this.namespace}/${key}`;
      registerEffect(this.actions[key], this.effects[key]);
    });

    // added reloadable action
    this.reloaders.forEach(reloader => {
      registerReloader(this.actions[reloader]);
    })

    // register subscribe
    this.triggers.forEach(trigger => {
      registerTrigger(trigger);
    });

    this.built = true;
  }

  dispatch(name: string) {
    const dispatch = SinkFactory.store && SinkFactory.store.dispatch;
    return (args: Array<any>) => dispatch && dispatch({
      type: this.actions[name],
      payload: args
    });
  }

  get dispatches() {
    return Object.keys(this.actions).reduce((accumulate: any, key) => (
      accumulate[key] = this.dispatch(key), accumulate
    ), {});
  }
}

function combineReducer(preloadedState: any, reducers: { [key: string]: PayloadHandler }) {
  return function(state: any, action: Action) {
    const reducer = reducers[action.type];
    if (reducer)
      return reducer(action.payload);
    return state === undefined ? preloadedState : state;
  }
}
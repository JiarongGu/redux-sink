
import { Dispatch, AnyAction } from 'redux';
import { ReducerEvent, ActionFunction, EffectEvent, TriggerEvent } from '../types';
import { registerReducer, getCurrentStore } from '../redux-registry';
import { registerEffect } from '../effect-middleware';
import { registerTrigger } from '../trigger-middleware';

export class SinkBuilder {
  // basic reducer config
  namespace!: string;
  stateProperty?: string;
  reducers: Array<ReducerEvent<any, any>>;

  // inital value of the service
  properties: { [key: string]: any };

  // handlers and actions
  effects: Array<EffectEvent>;
  triggers: Array<TriggerEvent>;
  dispatches: { [key: string]: ActionFunction };
  actions: { [key: string]: string };

  dispatch!: Dispatch<AnyAction>;
  built: boolean;
  
  constructor() {
    this.reducers = [];
    this.effects = [];
    this.triggers = [];
    this.actions = {};
    this.dispatches = {};
    this.properties = {};
    this.built = false;
  }

  build(namespace: string, prototype: any) {
    if (this.built) 
      return; 
    
    this.namespace = namespace;

    // set dispatch function
    this.dispatch = (...args) => getCurrentStore().dispatch(...args);

    // set default prototype values
    Object.keys(this.properties).forEach((key) => {
      prototype[key] = this.properties[key];
    });

    // create reducer if there is state and reducers
    if (this.stateProperty && this.reducers.length > 0) {
      buildReducer(namespace, this.stateProperty, prototype, this.reducers, this.properties);
    }

    // register effects
    this.effects.forEach(effect => registerEffect(effect));
    
    // register subscribe
    this.triggers.forEach(trigger => {
      let action = trigger.action;

      if (trigger.service) {
        const servicePrototype = trigger.service.prototype;
        if (servicePrototype === prototype) {
          action = this.actions[action];
        } else {
          action = getSinkBuilder(servicePrototype).actions[action];
        }
      }
      registerTrigger({ ...trigger, action });
    });

    this.built = true;
  }
}

function buildReducer(namespace: string, stateProperty: string, prototype: any, reducers: Array<ReducerEvent<any, any>>, properties: Object) {
  const currentStore = getCurrentStore();
  const currentState = currentStore && currentStore.getState();
  const serviceState = currentState && currentState[namespace] || properties[stateProperty];
  const initalState = serviceState === undefined ? null : serviceState;
  
  // match the prototype state to initalState
  prototype[stateProperty] = initalState;

  // create updater that can update service state
  const serviceStateUpdater = (state: any) => {
    prototype[stateProperty]= state 
  };

  registerReducer({ 
    namespace, initalState, reducerEvents: reducers, serviceStateUpdater
  });
}

export function getSinkBuilder(prototype: any): SinkBuilder {
  if (!prototype._sinkBuilder) {
    prototype._sinkBuilder = new SinkBuilder();
  }
  return prototype._sinkBuilder;
}
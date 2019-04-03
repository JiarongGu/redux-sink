
import { Constructor, TriggerOptions } from './typings';
import { Sink } from './Sink';

const staticIgnoredProperties = ['constructor', '__sinkBuilder__'];

export class SinkBuilder {
  state?: any;
  sinkPrototype!: any;
  sinkConstructor!: Constructor;

  // configured by decorator
  namespace!: string;
  stateProperty?: string;
  reducers: { [key: string]: Function };
  effects: { [key: string]: Function };

  triggers: { [key: string]: {
    actionType: string;
    handler: Function;
    options?: TriggerOptions;
  }};

  // auto generated
  _dispatches?: { [key: string]: Function };
  _actions?: { [key: string]: string };

  constructor(sink: any) {
    this.reducers = {};
    this.effects = {};

    this.triggers = {};
    this.sinkPrototype = sink;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype.__sinkBuilder__) {
      prototype.__sinkBuilder__ = new SinkBuilder(prototype);
    }
    return prototype.__sinkBuilder__;
  }

  createSink() {
    const sink = new Sink();
    const instance = new this.sinkConstructor();

    // initalize
    sink.namespace = this.namespace;
    sink.stateProperty = this.stateProperty;
    const reducerKeys = Object.keys(this.reducers);
    const effectKeys = Object.keys(this.effects);
    const triggerKeys = Object.keys(this.triggers);

    const instanceProperties = Object.keys(instance);
    const ignoredProperties = [ 
      ...staticIgnoredProperties, 
      ...instanceProperties, 
      ...reducerKeys, 
      ...effectKeys, 
      ...triggerKeys
    ];

    const prototypeProperties = Object
      .getOwnPropertyNames(this.sinkPrototype)
      .filter(name => !ignoredProperties.some(x => x ===name));
      
    instanceProperties.forEach((key) => {
      sink.instance[key] = instance[key];
    });
    
    prototypeProperties.forEach((key) => {
      const property = Object.getOwnPropertyDescriptor(this.sinkPrototype, key);
      if (property !== undefined)
        Object.defineProperty(sink.instance, key, property);
    })

    if (sink.stateProperty) {
      sink.state = instance[sink.stateProperty];
      Object.defineProperty(sink.instance, sink.stateProperty, {
        get: () => sink.state,
        set: (value) => { sink.state = value }
      });
    }

    // set dispatchers
    reducerKeys.forEach(name => {
      const reducer = this.reducers[name].bind(sink.instance);
      sink.instance[name] = function () {
        return sink.dispatch(name)(Array.from(arguments));
      };
      sink.reducers[name] = (args: Array<any>) => {
        const newState = reducer(...args);
        sink.instance[sink.stateProperty!] = newState;
        return newState;
      };
    });

    effectKeys.forEach(name => {
      const effect = this.effects[name].bind(sink.instance);
      sink.instance[name] = function () {
        return sink.dispatch(name)(Array.from(arguments));
      };  
      sink.effects[name] = (payload: Array<any>) => effect(...payload);
    });

    triggerKeys.forEach(name => {
      const trigger = this.triggers[name];
      const bindedHandler = trigger.handler.bind(sink.instance);
      const handler = (action: any) => 
        action.fromSink ? bindedHandler(...action.payload) : bindedHandler(action.payload);

      sink.triggers[name] = { ...trigger, handler };
      sink.instance[name] = handler;
    });

    return sink;
  }
}
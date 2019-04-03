
import { TriggerEvent, Constructor } from './typings';
import { Sink } from './Sink';

export class SinkBuilder {
  state?: any;
  sinkPrototype!: any;
  sinkConstructor!: Constructor;

  // configured by decorator
  namespace!: string;
  stateProperty?: string;
  reducers: { [key: string]: any };
  effects: { [key: string]: any };
  triggers: { [key: string]: TriggerEvent };

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
    const properties = Object.keys(instance);

    properties.forEach((key) => {
      sink.instance[key] = instance[key];
    });

    if (sink.stateProperty) {
      sink.state = instance[sink.stateProperty];
      Object.defineProperty(sink.instance, sink.stateProperty, {
        get: () => sink.state,
        set: (value) => { sink.state = value }
      });
    }

    // set dispatchers
    Object.keys(this.reducers).forEach(name => {
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

    Object.keys(this.effects).forEach(name => {
      const effect = this.effects[name].bind(sink.instance);
      sink.instance[name] = function () {
        return sink.dispatch(name)(Array.from(arguments));
      };  
      sink.effects[name] = (payload: Array<any>) => effect(...payload);
    });

    Object.keys(this.triggers).forEach(actionType => {
      const trigger = this.triggers[actionType];
      const handler = trigger.handler.bind(sink.instance);
      sink.triggers[actionType] = { ...trigger, handler };
    });

    return sink;
  }
}
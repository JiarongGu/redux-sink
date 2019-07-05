
import { Constructor, TriggerOptions, BuildSinkParams } from './typings';
import { Sink } from './Sink';
import { reduceKeys } from './utilities';

const staticIgnoredProperties = ['constructor', '__sinkBuilder__'];

export class SinkBuilder {
  sinkPrototype!: any;
  sinkConstructor!: Constructor;

  // configured by decorator
  namespace!: string;
  state: { [key: string]: any };
  effects: { [key: string]: Function };

  // for injecting internal sinks
  injectSinkConstructors!: Array<Constructor>;

  triggers: Array<{
    actionType: string;
    handler: Function;
    options?: TriggerOptions;
  }>;

  // auto generated
  _dispatches?: { [key: string]: Function };
  _actions?: { [key: string]: string };

  constructor(sink: any) {
    this.effects = {};
    this.state = {};

    this.triggers = [];
    this.sinkPrototype = sink;
  }

  static get(prototype: any): SinkBuilder {
    if (!prototype.__sinkBuilder__) {
      prototype.__sinkBuilder__ = new SinkBuilder(prototype);
    }
    return prototype.__sinkBuilder__;
  }

  buildSink(params: BuildSinkParams) {
    const sink = new Sink(params.getStore);
    const injectSinks = this.injectSinkConstructors.map(s => params.getSink(s));
    const instance = new this.sinkConstructor(...injectSinks);

    // initialize
    sink.namespace = this.namespace;
    sink.state = this.state;

    const effectKeys = Object.keys(this.effects);
    const stateKeys = Object.keys(this.state);

    const instanceProperties = Object.keys(instance);
    const ignoredProperties = [
      ...staticIgnoredProperties,
      ...instanceProperties,
      ...effectKeys,
    ];

    const prototypeProperties = Object
      .getOwnPropertyNames(this.sinkPrototype)
      .filter(name => !ignoredProperties.some(x => x === name));

    instanceProperties.forEach((key) => {
      sink.instance[key] = instance[key];
    });

    prototypeProperties.forEach((key) => {
      const property = Object.getOwnPropertyDescriptor(this.sinkPrototype, key);
      if (property !== undefined)
        Object.defineProperty(sink.instance, key, property);
    });

    let dispatcherProperties = {};

    if (stateKeys.length > 0) {
      // combine states
      sink.state = reduceKeys(stateKeys, (key) => instance[key]);

      // create reducers handlers
      sink.reducers = reduceKeys(stateKeys, (key) => this.createStateReducer(sink, key));

      // set reducer dispatchers
      Object.assign(dispatcherProperties, reduceKeys(stateKeys, (key) => this.createReducerDispatcher(sink, key)));
    }

    if (effectKeys.length > 0) {
      // create effect handlers
      sink.effects = reduceKeys(effectKeys, (key) => this.createEffect(key, sink.instance));

      // create effect dispatchers
      Object.assign(dispatcherProperties, reduceKeys(effectKeys, (key) => this.createEffectDispatcher(sink, key)));
    }

    // assign dispatchers to instance
    Object.defineProperties(sink.instance, dispatcherProperties);

    this.triggers.forEach(trigger => {
      const bindHandler = trigger.handler.bind(sink.instance);
      const handler = (action: any) =>
        action.packed ? bindHandler(...action.payload) : bindHandler(action.payload);
      sink.triggers.push({ ...trigger, handler });
    });

    return sink;
  }

  private createStateReducer(sink: Sink, name: string) {
    return (state: any, value: any) => {
      if (state[name] === value) {  
        return state; 
      } else {
        sink.state = { ...state, [name]: value }
        return sink.state;
      }
    };
  }

  private createReducerDispatcher(sink: Sink, name: string) {
    return {
      get: () => sink.state[name],
      set: (value: any) => sink.dispatch(name)(value, false)
    }
  }

  private createEffectDispatcher(sink: Sink, name: string) {
    return {
      value: function () {
        return sink.dispatch(name)(Array.from(arguments), true);
      }
    }
  }

  private createEffect(name: string, instance: any) {
    const effect = this.effects[name].bind(instance);
    return (payload: Array<any>) => effect(...payload);
  }
}

import { Sink } from './Sink';
import { BuildSinkParams, Constructor, TriggerOptions, SinkAction } from './typings';
import { reduceKeys } from './utilities';

const staticIgnoredProperties = ['constructor', '__sinkBuilder__'];

export class SinkBuilder {

  public static get(prototype: any): SinkBuilder {
    if (!prototype.__sinkBuilder__) {
      prototype.__sinkBuilder__ = new SinkBuilder(prototype);
    }
    return prototype.__sinkBuilder__;
  }
  public sinkPrototype!: any;
  public sinkConstructor!: Constructor;

  // configured by decorator
  public namespace!: string;
  public state: { [key: string]: any };
  public effects: { [key: string]: (...args: Array<any>) => any };

  // for injecting internal sinks
  public injectSinkConstructors!: Array<Constructor>;

  public triggers: Array<{
    actionType: string;
    handler: (...args: Array<any>) => any;
    options?: TriggerOptions;
  }>;

  // auto generated
  public _dispatches?: { [key: string]: (...args: Array<any>) => any };
  public _actions?: { [key: string]: string };

  constructor(sink: any) {
    this.effects = {};
    this.state = {};

    this.triggers = [];
    this.sinkPrototype = sink;
  }

  public buildSink(params: BuildSinkParams) {
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
      if (property !== undefined) {
        Object.defineProperty(sink.instance, key, property);
      }
    });

    const dispatcherProperties = {};

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
      const handler = (action: SinkAction) => {
        const payload = action.sink ? action.payload : [action.payload];
        return trigger.handler.apply(sink.instance, payload);
      };
      sink.triggers.push({ ...trigger, handler });
    });

    return sink;
  }

  private createReducerDispatcher(sink: Sink, name: string) {
    return {
      get: () => sink.state[name],
      set: (value) => sink.dispatch(name)([value])
    };
  }

  private createEffectDispatcher(sink: Sink, name: string) {
    return {
      value: (...args) => sink.dispatch(name)(args)
    };
  }

  private createStateReducer(sink: Sink, name: string) {
    return (state: any, [value]) => {
      if (state[name] === value) {
        return state;
      } else {
        sink.state = { ...state, [name]: value };
        return sink.state;
      }
    };
  }

  private createEffect(name: string, instance: any) {
    return (payload) => {
      return this.effects[name].apply(instance, payload);
    };
  }
}

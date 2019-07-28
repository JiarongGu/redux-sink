
import { Sink } from './Sink';
import { AnyFunction, BuildSinkParams, Constructor, SinkAction, TriggerEvent } from './typings';
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
  public effects: { [key: string]: AnyFunction };

  // for injecting internal sinks
  public injectSinkConstructors!: Array<Constructor>;

  public triggers: Array<TriggerEvent>;

  // auto generated
  public _dispatches?: { [key: string]: AnyFunction };
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

    // create trigger handlers
    sink.triggers = this.triggers.map(trigger => this.createTrigger(trigger, sink.instance));

    return sink;
  }

  private createReducerDispatcher(sink: Sink, name: string) {
    return {
      get: () => sink.state[name],
      set: (value: any) => sink.dispatch(name, value, false)
    };
  }

  private createEffectDispatcher(sink: Sink, name: string) {
    return {
      value: (...args: Array<any>) => sink.dispatch(name, args, true)
    };
  }

  private createStateReducer(sink: Sink, name: string) {
    return (state: any, value: any) => {
      if (state[name] === value) {
        return state;
      } else {
        sink.state = { ...state, [name]: value };
        return sink.state;
      }
    };
  }

  private createEffect(name: string, instance: any): (payload: Array<any>) => any {
    return (payload) => {
      return this.effects[name].apply(instance, payload);
    };
  }

  private createTrigger(trigger: TriggerEvent, instance: any): TriggerEvent {
    const handler = (action: SinkAction) => {
      const { rawAction, formatter } = trigger.options;
      let payload: Array<any> = [];

      if (rawAction) {
        payload = [action];
      } else {
        payload = action.packed ? action.payload : [action.payload];
      }

      if (formatter) {
        payload = [formatter.apply(null, payload)];
      }

      return trigger.handler.apply(instance, payload);
    };
    return { ...trigger, handler };
  }
}

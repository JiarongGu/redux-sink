import { Sink } from './Sink';
import { SinkContainer } from './SinkContainer';
import { AnyFunction, Constructor, SinkAction, SinkContainerAPI, TriggerEvent } from './typings';
import { reduceKeys } from './utilities';

export class SinkBuilder {
  public static sinks = new Map<any, SinkBuilder>();
  public static get(prototype: any): SinkBuilder {
    let sinkBuilder = SinkBuilder.sinks.get(prototype);
    if (!sinkBuilder) {
      sinkBuilder = new SinkBuilder(prototype);
      const base = Object.getPrototypeOf(prototype);
      const baseConstructor = base && base.constructor;

      if (baseConstructor && baseConstructor !== Object && baseConstructor.name) {
        // try to find base builder
        const baseBuilder = SinkBuilder.get(base);
        Object.assign(sinkBuilder.state, baseBuilder.state);
        Object.assign(sinkBuilder.effects, baseBuilder.effects);
        sinkBuilder.triggers.push(...baseBuilder.triggers);
      }
      SinkBuilder.sinks.set(prototype, sinkBuilder);
    }
    return sinkBuilder;
  }

  public sinkPrototype!: any;
  public sinkConstructor!: Constructor;

  // configured by decorator
  public namespace!: string;
  public state: { [key: string]: any } = {};
  public effects: { [key: string]: AnyFunction } = {};

  // for injecting internal sinks
  public sinkInjects!: Array<Constructor | SinkContainer>;

  public triggers: Array<TriggerEvent> = [];

  // auto generated
  public _dispatches?: { [key: string]: AnyFunction };
  public _actions?: { [key: string]: string };

  private constructor(sink: any) {
    this.sinkPrototype = sink;
  }

  /**
   * build sink based on sink builder properties
   * @param params container api for getSink and getStore
   */
  public buildSink(container: SinkContainerAPI): Sink {
    const sink = new Sink(container.getStore);
    const constructorInjects: Array<any> = [];

    // sink decorator can also inject sink, sink container or other stuff
    for (const inject of this.sinkInjects) {
      try {
        // try to inject with sink
        const injectableSink = container.getSink(inject);
        constructorInjects.push(injectableSink);
      } catch {
        // if we fill to inject sink, inject the input from sinkInject
        constructorInjects.push(inject);
      }
    }
    const instance = new this.sinkConstructor(...constructorInjects);

    // initialize
    sink.namespace = this.namespace;
    sink.state = this.state;

    const definedProperties = reduceKeys(
      // get properties in prototype but constructor
      Object.getOwnPropertyNames(this.sinkPrototype).filter(name => name !== 'constructor'),
      key => Object.getOwnPropertyDescriptor(this.sinkPrototype, key)
    );

    Object.assign(definedProperties, reduceKeys(
      Object.keys(instance),
      key => Object.getOwnPropertyDescriptor(instance, key)
    ));

    const stateKeys = Object.keys(this.state);
    if (stateKeys.length > 0) {
      // combine states
      sink.state = reduceKeys(stateKeys, (key) => instance[key]);

      // create reducer / dispatcher
      sink.reducers = reduceKeys(stateKeys, (key) => this.createReducer(sink, key));
      Object.assign(definedProperties, reduceKeys(stateKeys, (key) => this.createReducerDispatcher(sink, key)));
    }

    const effectKeys = Object.keys(this.effects);
    if (effectKeys.length > 0) {

      // create effect / dispatcher
      sink.effects = reduceKeys(effectKeys, (key) => this.createEffect(key, sink.instance));
      Object.assign(definedProperties, reduceKeys(effectKeys, (key) => this.createEffectDispatcher(sink, key)));
    }

    // assign dispatchers to instance
    Object.defineProperties(sink.instance, definedProperties);

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

  private createReducer(sink: Sink, name: string) {
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
        payload = action.effect ? action.payload : [action.payload];
      }

      if (formatter) {
        payload = [formatter.apply(null, payload)];
      }

      return trigger.handler.apply(instance, payload);
    };
    return { ...trigger, handler };
  }
}

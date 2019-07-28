import { Middleware, Store } from 'redux';
import { Sink } from './Sink';

export type Constructor<T = any> = new (...args: Array<any>) => T;

export type EffectHandler<TPayload = any> = (payload: TPayload) => any;
export type ReduceHandler<TPayload = any> = (state: any, payload: TPayload) => any;
export type TriggerHandler = (action: SinkAction) => any;

export interface TriggerOptions {
  priority?: number;
  fireOnInit?: boolean; /** default true */
}

export interface TriggerEvent {
  actionType: string;
  handler: TriggerHandler;
  options?: TriggerOptions;
}

export interface StoreConfiguration<TState = any> {
  reducers?: { [key: string]: any };
  middlewares?: Array<Middleware>;
  preloadedState?: TState;
  devToolOptions?: DevToolOptions;
}

export interface BuildSinkParams {
  getStore: () => Store | undefined;
  getSink: (constructor: Constructor) => Sink;
}

export interface DevToolOptions {
  devToolCompose: (...args: Array<any>) => any;
  disabled?: boolean;
  [key: string]: any;
}

export interface SinkAction {
  type: string;
  payload: any;
  sink?: boolean;
}

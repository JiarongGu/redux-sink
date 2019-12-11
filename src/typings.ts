import { Action, Middleware, Store } from 'redux';

import { Sink } from './Sink';
import { SinkContainer } from './SinkContainer';

export type Constructor<T = any> = new (...args: Array<any>) => T;

export type EffectHandler<TPayload = any> = (payload: TPayload) => any;
export type ReducerHandler<TPayload = any> = (state: any, payload: TPayload) => any;
export type AnyFunction = (...args: Array<any>) => any;
export type SinkSubscriber<T> = (sink: { [key in keyof T]: keyof T }) => Array<keyof T>;

export interface ReducerHandlerMap {
  [key: string]: ReducerHandler;
}

export interface TriggerOptions {
  priority?: number;      // default: 0
  lazyLoad?: boolean;  // default: true
  rawAction?: boolean;    // default: false
  formatter?: AnyFunction;
}

export interface TriggerEvent {
  actionType: string;
  handler: AnyFunction;
  options: TriggerOptions;
}

export interface TriggerEventHandler {
  priority: number;
  handler: AnyFunction;
}

export interface MiddlewareService {
  invoke: (action: SinkAction) => MiddlewareServiceResult;
}

export interface MiddlewareServiceResult {
  value: Promise<any>;
  isMiddlewareResult?: boolean;
}

export interface DefaultSinkConfiguration {
  middlewares: Array<Middleware>;
  reducers: { [key: string]: any };
  useEffectTrace: boolean;
  useTrigger: boolean;
}

export interface SinkConfiguration<TState = any> {
  preloadedState?: TState;
  reducers?: { [key: string]: any };
  middlewares?: Array<Middleware>;
  useEffectTrace?: boolean;
  useTrigger?: boolean;
  devToolOptions?: DevToolOptions;
}

export interface StoreConfiguration<TState = any> {
  preloadedState?: TState;
  middlewares: Array<Middleware>;
  reducers: { [key: string]: any };
  devToolOptions?: DevToolOptions;
}

export interface SinkContainerAPI {
  getStore: () => Store | undefined;
  getSink: (constructor: Constructor | SinkContainer) => Sink;
}

export interface DevToolOptions {
  devToolCompose: AnyFunction;
  disabled?: boolean;
  [key: string]: any;
}

export interface SinkAction extends Action {
  type: string;
  payload: any;
  effect?: boolean;
}

export type SinkDispatch = (...args: Array<any>) => SinkAction | undefined;
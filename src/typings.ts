import { Action, Middleware, Store } from 'redux';

import { Sink } from './Sink';
import { SinkContainer } from './SinkContainer';

export type Constructor<T = any> = new (...args: Array<any>) => T;

export type EffectHandler<TPayload = any> = (payload: TPayload) => any;
export type ReducerHandler<TPayload = any> = (state: any, payload: TPayload) => any;
export type AnyFunction = (...args: Array<any>) => any;

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

export interface IMiddlewareService {
  invoke: (action: SinkAction) => Promise<any>;
}

export interface SinkConfiguration<TState = any> {
  reducers?: { [key: string]: any };
  middlewares?: Array<Middleware>;
  effectTrace?: boolean;
  useTrigger?: boolean;
  preloadedState?: TState;
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

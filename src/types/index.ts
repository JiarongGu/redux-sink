import { Middleware, MiddlewareAPI } from 'redux';

export type Constructor<T = any, A = any> = { new(...args: Array<A>): T };

// action / reducer
export interface Action<Payload = any> {
  type: string;
  payload?: Payload;
}
export type Reducer<TState, TPayload> = (state: TState, action: Action<TPayload>) => TState;

// functions
export type Function = (...args: any[]) => any;
export type EffectFunction<TPayload = any>  = (store: MiddlewareAPI, payload: TPayload) => any;
export type ActionFunction = (...args: any[]) => Action;
export type ReducerFunction<TState = any, TPayload = any> = (state: TState, payload?: TPayload) => TState;

// events
export interface ReducerEvent<TState, TPayload> {
  action: ActionFunction;
  reducer: { [key: string]: Reducer<TState, TPayload> };
}
export interface EffectEvent {
  action: ActionFunction;
  effect: EffectFunction;
};

export interface TriggerEvent {
  action: string; 
  service?: Constructor;
  process: Function; 
  priority?: number
};

export interface ReducerRegistration<TState> {
  namespace: string;
  initalState: TState;
  reducerEvents: Array<ReducerEvent<TState, any>>;
  serviceStateUpdater?: (state: TState) => void;
}

export interface DynamicReducerMap {
  namespace: string;
  reducer: Reducer<any, any>;
  serviceStateUpdater?: (state: any) => void;
}

export interface StoreConfiguration<TState = any> {
  reducers?: { [key: string]: any };
  middlewares?: Middleware[];
  preloadedState?: TState;
  devTool?: boolean;
}
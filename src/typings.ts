import { Middleware, Store } from 'redux';

export type Constructor<T = any, A = any> = { new(...args: Array<A>): T };

// action / reducer
export interface Action<Payload = any> {
  type: string;
  payload?: Payload;
}
export type Reducer<TState, TPayload> = (state: TState, action: Action<TPayload>) => TState;

// functions
export type Function = (...args: Array<any>) => any;
export type PayloadHandler<TPayload = any> = (payload: TPayload) => any;
export type ActionFunction = (...args: Array<any>) => Action;

export interface TriggerEvent {
  action: string;
  handler: PayloadHandler;
  priority?: number
};

export interface StoreConfiguration<TState = any> {
  reducers?: { [key: string]: any };
  middlewares?: Array<Middleware>;
  preloadedState?: TState;
  devtoolOptions?: DevtoolOptions;
}

export interface DevtoolOptions {
  devToolCompose: Function,
  disabled?: boolean,
  [key: string]: any,
}

export interface ISinkFacotry {
  addReducer(namespace: string, reducer: Reducer<any, any>, sinkStateUpdater: (state: any) => void);
  addEffect(action: string, handler: PayloadHandler);
  addTrigger(action: string, handler: PayloadHandler, priority?: number);
  addReloader(action: string, payload: any);
  store?: Store;
}
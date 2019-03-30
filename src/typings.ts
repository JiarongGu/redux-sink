import { Middleware } from 'redux';

export type Constructor<T = any, A = any> = { new(...args: Array<A>): T };

export interface Action<Payload = any> {
  type: string;
  payload?: Payload;
}

export type PayloadHandler<TPayload = any> = (payload: TPayload) => any;

export interface TriggerOptions {
  priority?: number;
  fireOnInit?: boolean;
}

export interface TriggerEvent {
  actionType: string;
  handler: PayloadHandler;
  options?: TriggerOptions;
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
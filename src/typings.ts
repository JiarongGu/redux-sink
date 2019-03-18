import { Middleware } from 'redux';

export type Constructor<T = any, A = any> = { new(...args: Array<A>): T };

// action / reducer
export interface Action<Payload = any> {
  type: string;
  payload?: Payload;
}
export type Reducer<TState, TPayload> = (state: TState, action: Action<TPayload>) => TState;

// functions
export type Function = (...args: any[]) => any;
export type PayloadHandler<TPayload = any>  = (payload: TPayload) => any;
export type ActionFunction = (...args: any[]) => Action;

export interface TriggerEvent {
  action: string;
  process: Function; 
  priority?: number
};

export interface StoreConfiguration<TState = any> {
  reducers?: { [key: string]: any };
  middlewares?: Middleware[];
  preloadedState?: TState;
  devTool?: boolean;
}
import { Dispatch, MiddlewareAPI } from 'redux';

import { IMiddlewareService, SinkAction } from '../typings';

export function createServiceMiddleware(service: IMiddlewareService) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<SinkAction>) => (action: any) => {
    service.invoke(action);
    return next(action);
  };
}

import { Dispatch, MiddlewareAPI } from 'redux';

import { MiddlewareService, SinkAction } from '../typings';

/**
 * create a middleware based on middleware service
 * @param service the service will be used in this middleware
 */
export function createServiceMiddleware(service: MiddlewareService) {
  return (store: MiddlewareAPI<any>) => (next: Dispatch<SinkAction>) => (action: any) => {
    const result = service.invoke(action);
    const nextResult = next(action);
    return result.isMiddlewareResult ? result.value : nextResult;
  };
}

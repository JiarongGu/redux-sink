import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { SinkContainer } from './SinkContainer';
import { Constructor, SinkSubscriber } from './typings';
import { mergeState, reduceKeys } from './utils';

export function createUseSink(container: SinkContainer) {
  return <T>(sink: Constructor<T>, subscriber: boolean | SinkSubscriber<T> = true): T => {
    if (subscriber) {
      const sinkPrototype = container.getSinkPrototype(sink);

      const storeStateSelector = useCallback((state) => {
        if (typeof subscriber === 'function') {
          const subscribes = subscriber(sinkPrototype.stateNames as any) as Array<string>;
          return reduceKeys(subscribes, key => state[sinkPrototype.namespace][key]);
        } else {
          return state[sinkPrototype.namespace];
        }
      }, [subscriber]);

      const storeState = useSelector<any, any>(storeStateSelector);

      const mergedState = useMemo(() =>
        mergeState<T>(storeState, sinkPrototype.state, sinkPrototype.dispatches
      ), [storeState, sinkPrototype]);

      return mergedState;
    }
    return container.getSink(sink);
  };
}

import { useSelector } from 'react-redux';

import { useMemo } from 'react';
import { SinkContainer } from './SinkContainer';
import { Constructor, SinkSubscriber } from './typings';
import { mergeState, reduceKeys } from './utils';

export function createUseSink(container: SinkContainer) {
  return <T>(sink: Constructor<T>, subscriber: boolean | SinkSubscriber<T> = true): T => {
    if (subscriber) {
      const sinkPrototype = container.getSinkPrototype(sink);
      let storeState;
      if (typeof subscriber === 'function') {
        const subscribes = subscriber(sinkPrototype.stateNames as any) as Array<string>;
        const subscribedStates: Array<any> = subscribes.map(key =>
          useSelector<any, any>(state => state[sinkPrototype.namespace][key])
        );

        storeState = useMemo(() =>
          reduceKeys(subscribes, (_, index) => subscribedStates[index])
        , subscribedStates);

      } else {
        storeState = useSelector<any, T>(state => state[sinkPrototype.namespace]);
      }

      return useMemo(() => mergeState<T>(storeState, sinkPrototype.state, sinkPrototype.dispatches), [storeState]);
    }
    return container.getSink(sink);
  };
}

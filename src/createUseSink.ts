import { useSelector } from 'react-redux';

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
        storeState = reduceKeys(subscribes, key =>
          useSelector<any, any>(state => state[sinkPrototype.namespace][key])
        );
      } else {
        storeState = useSelector<any, T>(state => state[sinkPrototype.namespace]);
      }
      return mergeState<T>(storeState, sinkPrototype.state, sinkPrototype.dispatches);
    }
    return container.getSink(sink);
  };
}

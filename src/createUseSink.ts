import { useSelector } from 'react-redux';

import { SinkContainer } from './SinkContainer';
import { Constructor, SinkSubscriber } from './typings';
import { mergeDispatchState, reduceKeys } from './utils';

export function createUseSink(container: SinkContainer) {
  return <T>(sink: Constructor<T>, subscriber: boolean | SinkSubscriber<T> = true): T => {
    if (subscriber) {
      const sinkPrototype = container.getSinkPrototype(sink);
      let sinkState;
      if (typeof subscriber === 'function') {
        const subscribes = subscriber(sinkPrototype.stateNames as any) as Array<string>;
        sinkState = reduceKeys(subscribes, key =>
          useSelector<any, any>(state => state[sinkPrototype.namespace][key])
        );
      } else {
        sinkState = useSelector<any, T>(state => state[sinkPrototype.namespace]);
      }
      return mergeDispatchState<T>(sinkPrototype.dispatches, sinkState);
    }
    return container.getSink(sink);
  };
}

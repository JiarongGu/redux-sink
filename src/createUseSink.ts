import { useSelector } from 'react-redux';

import { SinkContainer } from './SinkContainer';
import { Constructor } from './typings';
import { mergeDispatchState } from './utils';

export function createUseSink(container: SinkContainer) {
  return <T>(sink: Constructor<T>, subscribe: boolean = true): T => {
    if (subscribe) {
      const sinkPrototype = container.getSinkPrototype(sink);
      const sinkState = useSelector<any, T>(state => state[sinkPrototype.namespace]);
      return mergeDispatchState<T>(sinkPrototype.dispatches, sinkState);
    }
    return container.getSink(sink);
  };
}

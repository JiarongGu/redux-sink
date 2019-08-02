import { useSelector } from 'react-redux';

import { SinkContainer } from './SinkContainer';
import { Constructor } from './typings';
import { mergeDispatchState } from './utilities';

export function createUseSink(container: SinkContainer) {
  return <T>(sink: Constructor<T>): T => {
    const sinkPrototype = container.getSinkPrototype(sink);
    const sinkState = useSelector<T, T>((state: any) => state[sinkPrototype.namespace]);
    return mergeDispatchState<T>(sinkPrototype.dispatches, sinkState);
  };
}

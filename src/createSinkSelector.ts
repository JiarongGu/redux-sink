import { useSelector } from 'react-redux';

import { SinkContainer } from './SinkContainer';
import { Constructor } from './typings';
import { mergeDispatchState } from './utilities';

export function createSinkSelector(container: SinkContainer) {
  return <T>(sink: Constructor<T>): T => {
    const containerSink = container.getSinkPrototype(sink);
    const sinkState = useSelector<T, T>((state: any) => state[containerSink.namespace]);
    return mergeDispatchState<T>(containerSink.dispatches, sinkState);
  };
}

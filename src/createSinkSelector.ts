import { useSelector } from 'react-redux';
import { SinkContainer } from './SinkContainer';
import { Constructor } from './typings';

export function createSinkSelector(container: SinkContainer) {
  return <T>(sink: Constructor<T>): T => {
    const containerSink = container.sinkPrototype(sink);
    const sinkState = useSelector<T, T>((state: any) => state[containerSink.namespace]);
    return { ...containerSink.dispatches, ...sinkState,  };
  }
}
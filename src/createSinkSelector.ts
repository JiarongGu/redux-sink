import { SinkContainer } from './SinkContainer';
import { useSelector } from 'react-redux';
import { Constructor } from './typings';

export function createSinkSelector(container: SinkContainer) {
  return <T>(sink: Constructor<T>): T | undefined => {
    const containerSink = container.sinkPrototype(sink);
    const sinkState = useSelector((state: any) => state[containerSink.namespace]);
    if (sinkState)
      return { ...containerSink.dispatches, ...sinkState,  };
    return undefined;
  }
}
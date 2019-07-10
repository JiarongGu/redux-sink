import { SinkContainer } from './SinkContainer';
import { useSelector } from 'react-redux';
import { Constructor } from './typings';

export function createSinkSelector(container: SinkContainer) {
  return (sink: Constructor) => {
    const containerSink = container.sinkPrototype(sink);
    const sinkState = useSelector((state: any) => { return state[containerSink.namespace] });
    const sinkSelector = { ...containerSink.dispatches, ...sinkState,  };
    return sinkSelector;
  }
}
import { SinkContainer } from './SinkContainer';
import { Constructor } from './typings';

export function createActionSelector(container: SinkContainer) {
  return <T>(sink: Constructor<T>, select: (sink: T) => any): string => {
    const sinkPrototype = container.getSinkPrototype(sink);
    return select(sinkPrototype.actions as any);
  };
}

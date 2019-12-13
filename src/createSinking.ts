import { connect, InferableComponentEnhancerWithProps } from 'react-redux';
import { SinkContainer } from './SinkContainer';
import { Constructor, SinkSubscriber } from './typings';
import { mergeState, reduceKeys } from './utils';

export function createSinking(container: SinkContainer) {
  return function <TSink, TStateProps = any, TOwnProps = any>(
    sink: Constructor<TSink>,
    subscriber: boolean | SinkSubscriber<TSink> = true
  ) {
    const sinkPrototype = container.getSinkPrototype(sink);
    const namespace = sinkPrototype.namespace;
    const mapDispatch = () => ({ [namespace]: sinkPrototype.dispatches });
    let mapState;
    if (subscriber) {
      if (typeof subscriber === 'function') {
        const subscribes = subscriber(sinkPrototype.stateNames as any) as Array<string>;
        mapState = (state) => ({
          [sinkPrototype.namespace]: reduceKeys(subscribes, key => state[sinkPrototype.namespace][key])
        });
      } else {
        mapState = (state) => ({ [sinkPrototype.namespace]: state[sinkPrototype.namespace] });
      }
    }
    const mergeProps = (state: any, dispatch: any, own: any) => ({
      [namespace]: mergeState(state[namespace], sinkPrototype.state, dispatch[namespace]),
      ...own
    });

    return connect(mapState, mapDispatch, mergeProps) as InferableComponentEnhancerWithProps<TStateProps, TOwnProps>;
  };
}

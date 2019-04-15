import { connect } from 'react-redux';
import { SinkFactory, SinkFactoryClass } from '../SinkFactory';
import { Constructor } from '../typings';
import { Sink } from '../Sink';

export function createSinking(factory: SinkFactoryClass) {
  return function (...sinks: Array<Constructor>) {
    const factorySinks = sinks.map(sink => factory.sinkPrototype(sink));
    return connect(
      createMapStateToProps(factorySinks),
      createMapDispatchToProps(factorySinks),
      createMergeProps(factorySinks)
    ) as any
  }
}
function createMapStateToProps(sinks: Array<Sink>) {
  return function (state: any) {
    return sinks.reduce((accumulate: any, sink) => {
      accumulate[sink.namespace] = state && state[sink.namespace];
      return accumulate;
    }, {});
  };
}

function createMapDispatchToProps(sinks: Array<Sink>) {
  return function () {
    return sinks.reduce((accumulate: any, sink) => (
      accumulate[sink.namespace] = sink.dispatches, accumulate
    ), {});
  };
}

function createMergeProps(sinks: Array<Sink>) {
  return function (stateProps: any, dispatchProps: any, ownProps: any) {
    return sinks.reduce((accumulate, sink) => {
      accumulate[sink.namespace] = {
        ...dispatchProps[sink.namespace],
        ...stateProps[sink.namespace]
      };
      return accumulate;
    }, { ...ownProps })
  }
}

/**
 * connect sinks with component, only connect state, reducers and effects
 * @param sinks array args of sinks
 */
export const sinking = createSinking(SinkFactory);
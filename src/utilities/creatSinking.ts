import { connect } from 'react-redux';
import { Constructor } from '../typings';
import { Sink } from '../Sink';
import { SinkContainer } from '../SinkContainer';

export function createSinking(container: SinkContainer) {
  return function (...sinks: Array<Constructor>) {
    const containerSinks = sinks.map(sink => container.sinkPrototype(sink));
    return connect(
      createMapStateToProps(containerSinks),
      createMapDispatchToProps(containerSinks),
      createMergeProps(containerSinks)
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
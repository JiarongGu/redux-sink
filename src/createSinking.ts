import { connect, Options } from 'react-redux';
import { Sink } from './Sink';
import { SinkContainer } from './SinkContainer';
import { Constructor } from './typings';
import { mergeDispatchState } from './utilities';

export function createSinking(container: SinkContainer, options?: Options) {
  return function(...sinks: Array<Constructor>) {
    const sinkPrototypes = sinks.map(sink => container.getSinkPrototype(sink));
    return connect(
      createMapStateToProps(sinkPrototypes),
      createMapDispatchToProps(sinkPrototypes),
      createMergeProps(sinkPrototypes),
      options
    ) as any;
  };
}

function createMapStateToProps(sinks: Array<Sink>) {
  return function(state: any) {
    return sinks.reduce((accumulate: any, sink) => {
      accumulate[sink.namespace] = state && state[sink.namespace];
      return accumulate;
    }, {});
  };
}

function createMapDispatchToProps(sinks: Array<Sink>) {
  return function() {
    return sinks.reduce((accumulate: any, sink) => (
      accumulate[sink.namespace] = sink.dispatches, accumulate
    ), {});
  };
}

function createMergeProps(sinks: Array<Sink>) {
  return function(stateProps: any, dispatchProps: any, ownProps: any) {
    return sinks.reduce((accumulate, sink) => {
      accumulate[sink.namespace] = mergeDispatchState(dispatchProps[sink.namespace], stateProps[sink.namespace]);
      return accumulate;
    }, { ...ownProps });
  };
}

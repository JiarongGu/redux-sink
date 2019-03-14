import { connect } from 'react-redux';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { SinkBuilder, getSinkBuilder } from '../sink-builder';
import { Constructor } from '../types';

export function sinking(...sinks: Array<Constructor>) {
  const sinkBuilders = sinks.map(sink => getSinkBuilder(sink.prototype));
  const namespaces = sinkBuilders.map(service => service.namespace);

  return connect(
    createMapStateToProps(namespaces),
    createMapDispatchToProps(sinks),
    createMergeProps(sinkBuilders)
  ) as any
}

function createMapStateToProps(namespaces: Array<string>) {
  return function (state: any) {
    return namespaces.reduce((accumulate: any, namespace) => {
      accumulate[namespace] = state && state[namespace];
      return accumulate;
    }, {});
  };
}

function createMapDispatchToProps(sinks: Array<Constructor>) {
  return function (dispatch: Dispatch<AnyAction>) {
    const dispatchs = sinks.reduce((accumulate: any, sink) => {
      const sinkBuilder = getSinkBuilder(sink.prototype);
      accumulate[sinkBuilder.namespace] = new sink();
      return accumulate;
    }, {});
    return dispatchs;
  };
}

function createMergeProps(sinkBuilders: Array<SinkBuilder>) {
  return function (stateProps: any, dispatchProps: any, ownProps: any) {
    return sinkBuilders.reduce((accumulate, service) => {
      accumulate[service.namespace] = dispatchProps[service.namespace];
      if (service.stateProperty)
        accumulate[service.namespace][service.stateProperty] = stateProps[service.namespace];

      return accumulate;
    }, { ...ownProps })
  }
}
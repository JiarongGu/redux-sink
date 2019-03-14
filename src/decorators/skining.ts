import { connect } from 'react-redux';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { SinkBuilder, getSinkBuilder } from '../sink-builder';
import { Constructor } from '../types';

export function sinking(...sinks: Array<Constructor>) {
  const sinkBuilders = sinks.map(sink => { 
    const sinkBuilder = getSinkBuilder(sink.prototype);
    if (!sinkBuilder.built) new sink();
    return sinkBuilder;
  });
  const namespaces = sinkBuilders.map(service => service.namespace);
  const prototype = sinks.map(sink => Object.getPrototypeOf(sink.prototype));

  return connect(
    createMapStateToProps(namespaces),
    createMapDispatchToProps(prototype),
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

const ignoredProperties = ['constructor', '_serviceBuilder'];

function createMapDispatchToProps(prototypes: Array<any>) {
  return function (dispatch: Dispatch<AnyAction>) {
    return prototypes.reduce((accumulate: any, prototype) => {
      const sinkBuilder = getSinkBuilder(prototype);
      accumulate[sinkBuilder.namespace] = 
        Object.getOwnPropertyNames(prototype)
          .filter(x => !ignoredProperties.includes(x))
          .reduce((a: any, c) => ( a[c] = prototype[c], a ), {});
      return accumulate;
    }, {});
  };
}

function createMergeProps(sinkBuilders: Array<SinkBuilder>) {
  return function (stateProps: any, dispatchProps: any, ownProps: any) {
    return sinkBuilders.reduce((accumulate, sinkBuilder) => {
      const state = sinkBuilder.stateProperty ? { [sinkBuilder.stateProperty]: stateProps[sinkBuilder.namespace] } : undefined;
      accumulate[sinkBuilder.namespace] = {
        ...dispatchProps[sinkBuilder.namespace],
        ...state
      };
      return accumulate;
    }, { ...ownProps })
  }
}
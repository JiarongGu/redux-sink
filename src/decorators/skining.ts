import { connect } from 'react-redux';
import { Dispatch } from 'react';
import { AnyAction } from 'redux';
import { SinkBuilder, getSinkBuilder } from '../sink-builder';
import { Constructor } from '../types';

export function deepsinking(...sinks: Array<Constructor>) {
  const sinkBuilders = ensureSinksBuilt(sinks);
  const namespaces = sinkBuilders.map(service => service.namespace);
  const prototypes = sinks.map(sink => Object.getPrototypeOf(sink.prototype));

  return connect(
    createMapStateToProps(namespaces),
    createDeepMapDispatchToProps(prototypes),
    createMergeProps(sinkBuilders)
  ) as any
}

export function sinking(...sinks: Array<Constructor>) {
  const sinkBuilders = ensureSinksBuilt(sinks);
  const namespaces = sinkBuilders.map(service => service.namespace);

  return connect(
    createMapStateToProps(namespaces),
    createMapDispatchToProps(sinkBuilders),
    createMergeProps(sinkBuilders)
  ) as any
}

function ensureSinksBuilt(sinks: Array<Constructor>) {
  return sinks.map(sink => { 
    const sinkBuilder = getSinkBuilder(sink.prototype);
    if (!sinkBuilder.built) new sink();
    return sinkBuilder;
  });
}

function createMapStateToProps(namespaces: Array<string>) {
  return function (state: any) {
    return namespaces.reduce((accumulate: any, namespace) => {
      accumulate[namespace] = state && state[namespace];
      return accumulate;
    }, {});
  };
}

function createMapDispatchToProps(sinkBuilders: Array<SinkBuilder>) {
  return function (dispatch: Dispatch<AnyAction>) {
    return sinkBuilders.reduce((accumulate: any, sinkBuilder) => (
      accumulate[sinkBuilder.namespace] = sinkBuilder.dispatches, accumulate
    ), {});
  };
}

const ignoredProperties = ['constructor', '_serviceBuilder'];
function createDeepMapDispatchToProps(prototypes: Array<any>) {
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
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { SinkBuilder } from '../SinkBuilder';
import { Constructor } from '../typings';
import { ensureSinkBuilt } from '../ensureSinksBuilt';

/**
 * connect sinks with component, only connect state, reducers and effects
 * @param sinks array args of sinks
 */
export function sinking(...sinks: Array<Constructor>) {
  const sinkBuilders = sinks.map(sink => ensureSinkBuilt(sink));
  const namespaces = sinkBuilders.map(sink => sink.namespace);

  return connect(
    createMapStateToProps(namespaces),
    createMapDispatchToProps(sinkBuilders),
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

function createMapDispatchToProps(sinkBuilders: Array<SinkBuilder>) {
  return function (dispatch: Dispatch) {
    return sinkBuilders.reduce((accumulate: any, sinkBuilder) => (
      accumulate[sinkBuilder.namespace] = sinkBuilder.dispatches, accumulate
    ), {});
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
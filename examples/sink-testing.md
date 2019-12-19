---
description: >-
  redux-sink provide a simple testing flow, here is the example of testing with
  `jest` along with `enzyme` and `typescript`
---

# Sink Testing

### Test sink class

Testing sink classes are simple because sink provides the injections based on containers, simply inject mock objects then you can test the logic of sink

```javascript
import { mocked } from 'ts-jest/utils';

import { HttpClient } from './http-client';
import { PatientAddSink } from './patient-add-sink';

jest.mock('./http-client');

// create mock object of httpclient which does external requests
const mockHttpClient = mocked(new HttpClient(), true);

describe('sink:: patient-add-sink', () => {
  beforeEach(() => {
    // create mock implementation of post to return a promise object
    // which is the same behavior as normal request call
    mockHttpClient.post.mockImplementation(x => {
      return Promise.resolve({} as any);
    });
  });

  it('should call api when submit', async () => {
    // create sink with mock httpclient
    const sink = new PatientAddSink(mockHttpClient as any);
    
    // set starting state
    sink.hospital = { name: 'test', id: 1, waitTime: 1 };
    sink.illness = { name: 'test', id: 1 };
    
    // run sink effect
    const promise = sink.submit();
    
    // check state before request finishes
    expect(sink.submitting).toBeTruthy();
    await promise;
    
    // check state after request completed
    expect(sink.submitting).toBeFalsy();
    expect(mockHttpClient.post.mock.calls).toHaveLength(1);
  });
});

```



### Test react component

Test the components by mock the `useSink` and `SinkContainer` without Provider wrapper

```jsx
import { shallow } from 'enzyme';
import * as React from 'react';
import { SinkContainer } from 'redux-sink';

import { PatientAddSection } from '../patient-add-section';
import { PatientAddSubmit } from '../patient-add-submit';
import { PatientAdd } from './patient-add';
import { PatientAddSink } from './patient-add-sink';

// mock original useSink by jest function
// return the sink from custom SinkContainer instead of SinkFactory
const reduxSink = require('redux-sink');
const sinkContainer = new SinkContainer();
reduxSink.useSink = jest.fn((sink) => sinkContainer.getSink(sink));

// create the container store, which has dispatch and event capability
sinkContainer.createStore();

describe('component:: patient-add', () => {
  it('should mount', () => {
    const container = shallow(<PatientAdd />);
    expect(container.html()).toBeTruthy();
  });
  
  it('should display hospital when illness selected', () => {
    // get the sink that used by component
    const sink = sinkContainer.getSink(PatientAddSink);
    // update the sink state
    sink.illness = { name: 'test', id: 1 };
    
    // shallow render the component by enzyme
    // component will updated according to sink state
    const container = shallow(<PatientAdd />);
    const sections = container.find(PatientAddSection);
    
    expect(sections.length).toEqual(2);
  });
});

```


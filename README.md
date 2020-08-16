# Redux Sink

[![travis](https://travis-ci.org/JiarongGu/redux-sink.svg?branch=master)](https://travis-ci.org/JiarongGu/redux-sink) [![npm version](https://badge.fury.io/js/redux-sink.svg)](https://www.npmjs.com/package/redux-sink) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ee58187b2e794033aeb4296f128fd3ee)](https://app.codacy.com/app/JiarongGu/redux-sink?utm_source=github.com&utm_medium=referral&utm_content=JiarongGu/redux-sink&utm_campaign=Badge_Grade_Dashboard)

Redux Sink is a decorator based using of React-Redux, uses class as the boundary of each redux state, no actions, no reducers, introduce state and effect decorator instead, natively support redux state and reducers to be loaded by code split. for an easier life of using state management

* [Getting started](./#getting-started)
  * [Step 1: create a store](./#step-1-create-store)
  * [Step 2: create a sink](./#step-2-create-sink)
  * [Step 3: sinking](./#step-3-sinking)
* [Examples](examples/)
* [API References](api-refernces/)
* [ChangeLog](changelog.md)

## Getting started

```bash
npm i redux-sink
```

### Step 1: create a store

create store use `SinkFactory.createStore`, then use `react-redux` or another library to connect the store with `Provider`.

```jsx
import { SinkFactory } from 'redux-sink';
const store = SinkFactory.createStore();

// for react
import { Provider } from 'react-redux';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
```

### Step 2: create a sink

redux state and effects managed by`sink`class, configured by decorators. to update the state, just simply assign the new state to it

```javascript
import { sink, state, effect } from 'redux-sink'

@sink('counter')
class CounterSink {
  @state count = 0;
  @state total = 0;

  @effect
  update(value) {
    this.total += value;
    this.count++;
  }
}
```

### Step 3: sinking

use `sinking` instead of `connect`, to connect sinks to a component, only `state` and `effect` can be used in components

```jsx
import { sinking } from 'redux-sink';
import { CounterSink } from './CounterSink';

@sinking(CounterSink)
class Counter extends React.Component {
  render() {
    const counter = this.props.counter;
    return (
      <div>
        <p>Current Total: <strong>{counter.total}</strong></p>
        <p>Current Count: <strong>{counter.count}</strong></p>
        <button onClick={() => counter.update(1)}>Increment</button>
        <button onClick={() => counter.update(-1)}>Decrement</button>
        <button onClick={() => counter.count++}>Count</button>
      </div>
    )
  }
}
```

{% hint style="info" %}
Use state or effect to update sink value in a component like an example above. both behave the same as redux dispatch when using in component
{% endhint %}

use sinking without the decorator

```jsx
import { sinking } from 'redux-sink';

export const Component = sinking(CounterSink)(ComponentClass);
```

use sink by hooks, require `react-redux: ^7.1.0`

```jsx
import { useSink } from 'redux-sink';
import { CounterSink } from './CounterSink';

const Component = () => {
  const counter = useSink(CounterSink);
  return (
    <div>
      <p>Current Count: <strong>{counter.count}</strong></p>
      <button onClick={() => counter.count++}>Increment</button>
      <button onClick={() => counter.count--}>Decrement</button>
    </div>
  )
}
```

## LICENSE

[MIT](https://github.com/JiarongGu/redux-sink/blob/master/LICENSE)


# Redux Sink

[![travis](https://travis-ci.org/JiarongGu/redux-sink.svg?branch=master)](https://travis-ci.org/JiarongGu/redux-sink) [![npm version](https://badge.fury.io/js/redux-sink.svg)](https://www.npmjs.com/package/redux-sink) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/ee58187b2e794033aeb4296f128fd3ee)](https://app.codacy.com/app/JiarongGu/redux-sink?utm_source=github.com&utm_medium=referral&utm_content=JiarongGu/redux-sink&utm_campaign=Badge_Grade_Dashboard)

Decorator based redux for less boilerplate, no actions, no reducers, no separated logic, also natively support redux to be loaded by code split.

## Index

* [Getting started](./#getting-started)
  * [Step 1: create store](./#step-1-create-store)
  * [Step 2: create sink](./#step-2-create-sink)
  * [Step 3: sinking](./#step-3-sinking)
* [API References](docs/api-refernces/)

## Getting started

`npm i redux-sink`

### Step 1: create store

create store use `SinkFactory.createStore`, then use `react-redux` or other library to connect the store with `Provider`.

#### index.js

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

### Step 2: create sink

logic block of state called `sink`, includes state, effect, configured by decorators. to update the state, just simply assign the new state to it

```javascript
import { sink, state, effect } from 'redux-sink'

@sink('counterSink')
class CounterSink {
  @state
  count = 0;

  @effect
  increment(value: number) {
    this.count = this.count + value;
  }

  @effect
  decrement(value: number) {
    this.count = this.count - value;
  }
}
```

### Step 3: sinking

use `sinking` instead of `connect`, to connect sinks to component, only `state` and `effect` can be used in components

```jsx
import { sinking } from 'redux-sink';
import { CounterSink } from './CounterSink';

@sinking(CounterSink)
class Counter extends React.Component {
  render() {
    const counter = this.props.counterSink;
    return (
      <div>
        <p>Current Count: <strong>{counter.count}</strong></p>
        <button onClick={() => counter.increment(1)}>Increment</button>
        <button onClick={() => counter.decrement(1)}>Decrement</button>
      </div>
    )
  }
}
```

using sinking with out decorator

```jsx
import { sinking } from 'redux-sink';

export const Component = sinking(CounterSink)(ComponentClass);
```

using sink by hooks, require `react-redux: ^7.1.0`

```jsx
import { useSink } from 'redux-sink';
import { CounterSink } from './CounterSink';

const Component = () => {
  const counter = useSink(CounterSink);
  return (
    <div>
      <p>Current Count: <strong>{counter.count}</strong></p>
      <button onClick={() => counter.increment(1)}>Increment</button>
      <button onClick={() => counter.decrement(1)}>Decrement</button>
    </div>
  )
}
```

## Documents

* [ChangeLog](docs/change-log.md)
* [API References](docs/api-refernces/)
* [Examples](examples/)

## LICENSE

[MIT](https://github.com/JiarongGu/redux-sink/blob/master/LICENSE)


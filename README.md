# Redux-Sink
Redux-Sink is decorater based redux for less boilerplate, no action, no reducer, no seprated logic, also natively support redux to be loaded by code split. 
    
[![travis](https://travis-ci.org/JiarongGu/redux-sink.svg?branch=master)](https://travis-ci.org/JiarongGu/redux-sink)
[![npm version](https://badge.fury.io/js/redux-sink.svg)](https://www.npmjs.com/package/redux-sink)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ee58187b2e794033aeb4296f128fd3ee)](https://app.codacy.com/app/JiarongGu/redux-sink?utm_source=github.com&utm_medium=referral&utm_content=JiarongGu/redux-sink&utm_campaign=Badge_Grade_Dashboard)

## Index
- [Getting started](#getting-started)
  * [Step 1: create store](#step-1-create-store)
  * [Step 2: create sink](#step-2-create-sink)
  * [Step 3: sinking](#step-3-sinking)
- [Advanced usages](#advanced-usages)
  * [Create trigger](#create-trigger)
  * [Use sink without component](#use-sink-without-component)
  * [Create store with configs](#create-store-with-configs)
  * [Use debounce/throttle](#use-debouncethrottle)
- [Api References](#api-references)

## Getting started
```npm i redux-sink```   

### Step 1: create store
create store use `SinkFactory.createStore`, then use `react-redux` or other library to connect the store with `Provider`.

#### index.js
```javascript
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
logic block of state called `sink`, includes state, reducer, effect, configured by decorators.

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
use `sinking` instead of `connect`, to connect sinks to component

```javascript
@sinking(CounterSink)
class Counter extends React.Component {
  render() {
    const counter = this.props.counterSink;
    return (
      <div>
        <p>Current Count: <strong>{counterSink.count}</strong></p>
        <button onClick={() => counterSink.increment(1)}>Increment</button>
        <button onClick={() => counterSink.decrement(1)}>Decrement</button>
      </div>
    )
  }
}
```
or   
```javascript
sinking(CounterSink)(Component)
```

## Advanced usages
### Create trigger
`@trigger` is used to trigger when effect or reducer action fired, the action name will be `{sink}/{function}`. the parameters should be the same as the orginal action.
```javascript
class CounterSink {
    ...
    @trigger('counter/updateAll')
    updateAllTrigger(increase: number, decrease: number) {
      this.decrement(decrease);
      this.increment(increase);
    }
}
```

### Use sink without component
redux-sink allowed you to use sinks without connect to component
```javascript
import { SinkFactory } from 'redux-sink';

// use SinkFactory to get current sink by sink class
const counterSink = SinkFactory.sink(CounterSink);
const counterState = counterSink.increment(10);
```

### Create store with configs
`SinkFactory.createStore` is able to take reducers, middlewares and devtoolOptions along with store creation
```javascript
import { SinkFactory } from 'redux-sink';

// its also possible to add reducers and middlewares through this api
const store = SinkFactory.createStore({ 
  reducers, // static reducers, built without creator
  preloadedState, // inital state
  middlewares, // addtional middlewares
  devtoolOptions: { devToolCompose: composeWithDevTools } // required compose function from redux-dev-tool
});
```

### Use debounce/throttle
you can use debounce or throttle from lodash or other library, to create decorator apply to sink functions. for `reducer` need to be used before `@reducer`
#### debounce.ts
```javascript
import _debounce from 'lodash/debounce';

export function debounce(wait: number, option?: any) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _debounce(descriptor.value, wait, option);
  }
}

```
#### throttle.ts
```javascript
import _throttle from 'lodash/throttle';

export function throttle(wait: number, option?: any) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _throttle(descriptor.value, wait, option);
  }
}

```
#### use debounce/throttle
```javascript
import { debounce } from './debounce';
import { throttle } from './throttle';

class Counter extends React.Component {
 ...
 @debounce(300)
 @reducer
  update(state: any) {
    return { ...this.state, ...state };
  }
}
```

## Api References
- [@sink](#sink)
- [@state](#state)
- [@reducer](#reducer)
- [@effect](#effect)
- [@trigger](#trigger-1)
- [@SinkFactory](#sinkFactory)
- [@SinkBuilder](#sinkBuilder)

### @sink
mark the class as redux-sink class, the sink name use to locate the sink in store

### @state
configure state property, state will be sync when reducer updates the store state, inital state created based on this property or preloadedState from store. you can have multiple states

### @effect
use to process side-effects and aysnc calls, will run inside effect middleware

### @trigger
use to bind extra event when action fires

### @reloader
use to fire trigger event when trigger dynamic loaded

### SinkFactory
main registry class for all sinks, manage the store and all loaded sinks

### SinkBuilder
build class embadded inside sink's protoype, which collect the sink configuration and build sink use `SinkFactory`

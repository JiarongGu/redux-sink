# Redux-Sink
Redux-Sink is redux for less boilerplate, no action, no seprated logic, also natively support redux to be loaded by code split.    
    
[![travis](https://travis-ci.org/JiarongGu/redux-sink.svg?branch=master)](https://travis-ci.org/JiarongGu/redux-sink)
[![npm version](https://badge.fury.io/js/redux-sink.svg)](https://www.npmjs.com/package/redux-sink)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ee58187b2e794033aeb4296f128fd3ee)](https://app.codacy.com/app/JiarongGu/redux-sink?utm_source=github.com&utm_medium=referral&utm_content=JiarongGu/redux-sink&utm_campaign=Badge_Grade_Dashboard)
 

## Getting started
```npm i redux-sink```   

### Step 1: create store
create store use `SinkFactory.createStore`.   

#### index.js
```javascript
import { SinkFactory } from 'redux-sink';
const store = SinkFactory.createStore({ 
    preloadedState, // inital state
    devtoolOptions: { devToolCompose: composeWithDevTools } // required compose function from redux-dev-tool
});
```

### Step 2: create sink
logic block of state called `sink`, includes state, reducer, effect, configured by decorators.

```javascript
import { sink, state, reducer, effect, connect } from 'redux-sink'

@sink('counter')
class CounterSink {
  @state
  state = 0;

  @reducer
  increment(value: number) {
    return this.state + value;
  }

  @reducer
  decrement(value: number) {
    return this.state - value;
  }

  @effect
  async updateAll(increase: number, decrease: number) {
    this.increment(increase);
    this.decrement(decrease);
  }
}
```

### Step 3: sinking
use `sinking` instead of `connect`, to connect sinks to component

```javascript
@sinking(CounterSink)
class Counter extends React.Component {
  render() {
    const counter = this.props.counter;
    return (
      <div>
        <p>Current Count: <strong>{counter.state}</strong></p>
        <button onClick={() => counter.increment(1)}>Increment</button>
        <button onClick={() => counter.decrement(1)}>Decrement</button>
        <button onClick={() => counter.updateAll(1, 2)}>All</button>
      </div>
    )
  }
}
```

## Configure using decorators
- [@sink](#sink)
- [@state](#state)
- [@reducer](#reducer)
- [@effect](#effect)
- [@trigger](#trigger)
- [@sinking/deepsinking](#sinking--deepsinking)

## @sink
```javascript
@sink('counter')
class CounterSink { ... }
```
set the class as redux sink, the name of sink use to locate the sink in props

## @state
```javascript
class CounterSink {
    @state
    state = { 
      increment: 0, 
      decrement: 0, 
      total: 0 
    };
}
```
configure inital state, can access state in sink class by `this.state`,
inital state created based on this property or inheritant from current store

## @reducer
`@reducer` use to update state, will trigger component update
```javascript
class CounterSink {
    ...
    @reducer
    increment(value: number) {
      return { ...this.state, increment: this.state.increment + number };
    }
}
```
warning: do not call reducer function in side reducer, use effect to do it

## @effect
`@effect` use to process side-effects and aysnc calls, will run inside effect middleware
```javascript
class CounterSink {
    ...
    @effect
    updateAll(value: number) {
      this.decrement(value);
      this.increment(value);
    }
}
```

## @trigger
`@trigger` is used to trigger multiple reducer functions, will run inside effect middleware
```javascript
class CounterSink {
    ...
    @trigger('action/function name', Sink/false)
    updateAll(value: number) {
      this.decrement(value);
      this.increment(value);
    }
}
```

## @sinking / deepsinking
use `@sinking` to connect sinks to component, `@deepsinking` allow you to use any function in sink when connect to component, `@sinking` will only allowed to use effect and reducer in component
```javascript
@sinking(CounterSink, OtherSink1, OtherSink2)
class Counter extends React.Component {
 ...
}

sinking(CounterSink, OtherSink1, OtherSink2)(Component)
```

## Properties
properties can be used and shared between sink instance, but will not trigger component refreash
```javascript
@sink('counter')
class CounterSink { 
  property1 = 0;
  property2 = 'property2 string';
}
```

## Api Reference
### SinkFactory
SinkFactory is the main registry class for all sinks, manage the store and all loaded sinks

## Advanced
### Combine store with other configs
`createStore` is able to take reducers, middleware and devtoolOptions to configure along with the store generation
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

### Use outside of component
```javascript
const counterSink = new CounterSink();
const counterState = counterSink.increment(10);
```

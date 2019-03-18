# Redux-Sink
redux sink for less boilerplate, also allow redux to be loaded by code split.    
![alt text](https://travis-ci.org/JiarongGu/redux-sink.svg?branch=master)

## Install
```npm i redux-sink```  

## Getting started
create a redux sink store
```javascript
import { configureSinkStore } from 'redux-sink';

// its also possible to add reducers and middlewares through this api
const store = configureCreatorStore({ 
  reducers, // static reducers, built without creator
  preloadedState, // inital state
  middlewares, // addtional middlewares
  devTool: true // enable redux-dev-tool
});
```
    
## Configure Reducers
using decorators to create redux sink class, can access redux state using class from everywhere you want.
- decorators: `@sink`, `@state`, `@reducer`, `@effect`, `@trigger`, `@sinking`, `@deepsinking`.  

hint: all instance created by sink class will shared in the same scope of its prototype.

## @sink
```javascript
@sink('counter')
class CounterSink { ... }
```
set the class as redux sink, the name of sink use to locate the sink in props

## @state
```javascript
@state
state = { 
  increment: 0, 
  decrement: 0, 
  total: 0 
};
```
configure inital state, can access state in sink class by `this.state`,
inital state created based on this property or inheritant from current store

## @reducer
`@reducer` use to update state, will trigger component update
```javascript
@reducer
increment(value: number) {
  return { ...this.state, increment: this.state.increment + number };
}
```
warning: do not call reducer function in side reducer, use effect to do it

## @effect
`@effect` use to process side-effects and aysnc calls, will run inside effect middleware
```javascript
@effect
updateAll(value: number) {
  this.decrement(value);
  this.increment(value);
}
```

## @trigger
`@trigger` is used to trigger multiple reducer functions, will run inside effect middleware
```javascript
@trigger('action/function name', Sink/false)
updateAll(value: number) {
  this.decrement(value);
  this.increment(value);
}
```


## @sinking / @deepsinking
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


## Example
### Create ReduxSink class
```javascript
import { sink, state, reducer, effect, connect } from 'redux-sink'

@sink('counter')
class CounterSink {
  @state
  state = { 
    increment: 0, 
    decrement: 0, 
    total: 0 
  };

  @reducer
  increment(value: number) {
    const increment = this.state.increment + value;
    const total = this.state.total + value;
    return { ...this.state, increment, total };
  }

  @reducer
  decrement(value: number) {
    const decrement = this.state.decrement - value;
    const total = this.state.total - value;
    return { ...this.state, decrement, total };
  }

  @effect
  updateAll(value: number) {
    this.decrement(value);
    this.increment(value);
  }
}
```

### Connect to component
```javascript
@sinking(CounterSink)
class Counter extends React.Component {
  render() {
    const counterSink = this.props.counter;
    return (
      <div>
        <h1>Counter</h1>
        <p>Current Increment: <strong>{counter.state.increment}</strong></p>
        <p>Current Decrement: <strong>{counter.state.decrement}</strong></p>
        <p>Current Total: <strong>{counter.state.total}</strong></p>
        <button onClick={() => counter.increment(2)}>Increment</button>
        <button onClick={() => counter.decrement(2)}>Decrement</button>
      </div>
    )
  }
}
```

### Use outside of component
```javascript
const counterSink = new CounterSink();
const counterState = counterSink.increment(10);
```

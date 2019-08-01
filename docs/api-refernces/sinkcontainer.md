---
description: SinkContainer use to keep store and all the sinks within the same scope.
---

# SinkContainer

Since `SinkFactory` is a instance of `SinkContainer` the api is the same, all the code example will be using `SinkFactory` for easier understanding the usage.

### createStore

use to create store with sink, it can take reducers, middlewares and devtoolOptions with configuration

```javascript
import { SinkFactory } from 'redux-sink';

// its also possible to add reducers and middlewares through this api
const store = SinkFactory.createStore({
  // static reducers, built without creator
  reducers,
  // initial state
  preloadedState,
  // additional middlewares
  middlewares,
  // required compose function from redux-dev-tool
  devToolOptions: { devToolCompose: composeWithDevTools } 
});
```

### getSink

use to get sink from current container, can use in any place

```javascript
import { SinkFactory } from 'redux-sink';
import { CounterSink } from './CounterSink';

const counter = SinkFactory.getSink(CounterSink);
```


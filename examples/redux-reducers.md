---
description: Create store with integrated redux reducers/middlewares.
---

# Redux Reducers/Middlewares

## Custom Reducers
```javascript
function counter(state, action) {
  switch (action.type) {
    case 'COUNTER_ADD':
      return state++;
    case 'COUNTER_MINUS':
      return state--;
    default:
      return state
  }
}

import { SinkFactory } from 'redux-sink';

const store = SinkFactory.createStore({
  reducers: {
    counter: counter
  }
});
```

## Custom Middlewares
```javascript
const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    })
    throw err
  }
}

import { SinkFactory } from 'redux-sink';

const store = SinkFactory.createStore({
  middlewares: [crashReporter]
});

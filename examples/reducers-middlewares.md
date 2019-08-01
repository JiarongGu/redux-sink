---
description: Create store with integrated redux reducers/middlewares.
---

# Reducers / Middlewares

You can also use `Factory.createStore` with regular redux reducer and middleware by supply the reducer and middlewares to it.

## Custom Reducers

{% code-tabs %}
{% code-tabs-item title="index.js" %}
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
{% endcode-tabs-item %}
{% endcode-tabs %}

## Custom Middlewares

{% code-tabs %}
{% code-tabs-item title="index.js" %}
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
```
{% endcode-tabs-item %}
{% endcode-tabs %}


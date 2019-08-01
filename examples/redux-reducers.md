---
description: Create store with redux reducers.
---

# Redux Reducers
redux-sink can also integrate with regular redux reducers.

## custom reducers
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
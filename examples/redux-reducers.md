---
description: Create store with different configurations.
---

# Redux Reducers

## custom reducers

redux-sink can also integrate with regular redux reducers.

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


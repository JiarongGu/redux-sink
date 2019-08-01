# Basic

basic use of `state`, `effect`, redux-sink maps dispatch automatically to component. so you don't have to create action or reducer.

## State

this is a simple counter component that uses sink state.

### counter-sink.js

```javascript
import { state, sink } from 'redux-sink';

@sink('counter')
export class CounterSink {
  @state value = 0;
}
```

### counter.jsx

```jsx
import { useSink } from 'redux-sink';
import { CounterSink } from './counter-sink';

export const Counter = () => {
  const counter = useSink(CounterSink);

  return (
    <div>
      <p>count: {counter.value}</p>
      <button onClick={() => counter.value++}>plus</button>
      <button onClick={() => counter.value--}>minus</button>
    </div>
  );
}
```


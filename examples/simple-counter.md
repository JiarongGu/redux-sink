---
description: simple counter use of redux-sink state
---

# Simple Counter

Sink states maps dispatch automatically to component. so you don't have to create action or reducer.

## Counter example

{% code-tabs %}
{% code-tabs-item title="counter-sink.js" %}
```javascript
import { state, sink } from 'redux-sink';

@sink('counter')
export class CounterSink {
  @state value = 0;
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% code-tabs %}
{% code-tabs-item title="counter.jsx" %}
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
{% endcode-tabs-item %}
{% endcode-tabs %}


---
description: use state to create a simple counter component
---

# Simple Counter

Sink states maps dispatch automatically to component. so you don't have to create action or reducer.

{% code-tabs %}
{% code-tabs-item title="CounterSink.js" %}
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
{% code-tabs-item title="Counter.jsx" %}
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


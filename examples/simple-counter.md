---
description: Use state to create a simple counter component
---

# Simple Counter

### Create CounterSink

Sink states maps dispatch automatically to the component. so you don't have to create action or reducer.

{% code title="CounterSink.js" %}
```javascript
import { state, sink } from 'redux-sink';

@sink('counter')
export class CounterSink {
  @state value = 0;
}
```
{% endcode %}

### Use external state without dispatches

{% code title="Counter.jsx" %}
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
{% endcode %}

{% hint style="warning" %}
The two-way update for the state is based on ****[defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty), so when updating object or array you still need to update the whole object reference. For example [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) or [Array.contact](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat)
{% endhint %}


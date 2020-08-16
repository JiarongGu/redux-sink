---
description: subscribe to selected state
---

# Subscriber

use subscriber on `useSink` or `sinking` can make component only subscribe changes on selected state  of the sink.

The default value is `true`, set the value to `false` it will not auto-update on any state, or you can use the subscriber function like the example below

### useSink

```jsx
import { state, sink, useSink } from 'redux-sink';

@sink('counter')
export class CounterSink {
  @state value = 0;
  @state count = 0;
}

export const Counter = () => {
  // this component now will only been updated based on `value` state
  // the `count` state will be updated only when component remounted
  const counter = useSink(CounterSink, sink => [sink.value]);

  return (
    <div>
      <p>count: {counter.value}</p>
      <button onClick={() => counter.value++}>plus</button>
      <button onClick={() => counter.value--}>minus</button>
    </div>
  );
}
```

### sinking

```jsx
import { sinking } from 'redux-sink';

export const SinkingCounter = sinking(CounterSink, (sink) => [sink.state])(Counter)
```

{% hint style="info" %}
For some more complex scenarios, you can set subscribe value to`false`which stops default update and use the complex selector from`react-redux`which is based library of`redux-sink`
{% endhint %}


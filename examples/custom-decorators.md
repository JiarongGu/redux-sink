---
description: Create custom decorators to control the behavior of sink functions.
---

# Custom Decorators

## @debounce

use debounce function from lodash.

{% code-tabs %}
{% code-tabs-item title="debounce.ts" %}
```javascript
import _debounce from 'lodash/debounce';

export function debounce(wait: number, option?: any) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _debounce(descriptor.value, wait, option);
  }
}
```

{% code-tabs %}
{% code-tabs-item title="counter.js" %}
```jsx
import { debounce } from './debounce';

class CounterSink extends React.Component {
 ...
  @debounce(300)
  @effect
  update(state: any) {
    this.state = state;
  }
}
```


## @throttle

use throttle function from lodash.

{% code-tabs %}
{% code-tabs-item title="throttle.ts" %}
```javascript
import _throttle from 'lodash/throttle';

export function throttle(wait: number, option?: any) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _throttle(descriptor.value, wait, option);
  }
}
```


{% code-tabs %}
{% code-tabs-item title="counter.js" %}
```jsx
import { throttle } from './throttle';

class CounterSink extends React.Component {
 ...
  @throttle(300)
  @effect
  update(state: any) {
    this.state = state;
  }
}
```

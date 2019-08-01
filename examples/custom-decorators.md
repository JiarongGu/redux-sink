# Custom Decorators

you can also create custom decorators to control the behavior of sink functions, below are the examples of using debounce//throttle function from lodash.

## debounce

### debounce.ts

```javascript
import _debounce from 'lodash/debounce';

export function debounce(wait: number, option?: any) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _debounce(descriptor.value, wait, option);
  }
}
```

### counter.js

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

## throttle

### throttle.ts

```javascript
import _throttle from 'lodash/throttle';

export function throttle(wait: number, option?: any) {
  return function (target: any, name: string, descriptor: PropertyDescriptor) {
    descriptor.value = _throttle(descriptor.value, wait, option);
  }
}
```

### counter.js

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


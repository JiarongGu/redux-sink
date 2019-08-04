---
description: SinkContainer use to keep store and all the sinks within the same scope.
---

# SinkContainer

Since `SinkFactory` is a instance of `SinkContainer` the api is the same, all the code example will be using `SinkFactory` for easier understanding the usage.

### createStore\(SinkConfiguration\) =&gt; Store

Create sink store, it can take reducers, middlewares and devToolOptions with configuration

{% tabs %}
{% tab title="Arguments" %}
```typescript
interface SinkConfiguration {
  // regular reducers
  reducers: { [key: string]: (state, action) => state },
  // predefined state
  preloadedState: { ...state },
  // additional middlewares
  middlewares: Array<ReduxMiddleware>,
  // required compose function from redux-dev-tool
  devToolOptions: {
    // devTool compose function
    devToolCompose: Function,
    // should devTool disabled
    disabled?: boolean,
    // other devTool properties
    [key: string]: any
  }
}
```
{% endtab %}

{% tab title="Example" %}
```javascript
import { SinkFactory } from 'redux-sink';

// its also possible to add reducers and middlewares through this api
const store = SinkFactory.createStore({
  reducers,
  preloadedState,
  middlewares,
  devToolOptions: { devToolCompose: composeWithDevTools } 
});
```
{% endtab %}
{% endtabs %}

### getSink\(SinkClass\) =&gt; SinkInstance

Get sink from current container using sink class

{% tabs %}
{% tab title="Arguments" %}
```typescript
type SinkClass = Constructor => SinkInstance
```
{% endtab %}

{% tab title="Example" %}
```javascript
import { SinkFactory } from 'redux-sink';
import { CounterSink } from './CounterSink';

const counter = SinkFactory.getSink(CounterSink);
```
{% endtab %}
{% endtabs %}

### getTasks\(\) =&gt; Array&lt;Promise&gt;

Get currently running async effects

{% tabs %}
{% tab title="Example" %}
```javascript
import { SinkFactory } from 'redux-sink';

Promise.all(SinkFactory.getTasks()).then(() => {
  // do something when all effects completed
});
```
{% endtab %}
{% endtabs %}

### getStore\(\) =&gt; Store

Get underlining redux store from the container

{% tabs %}
{% tab title="Example" %}
```javascript
import { SinkFactory } from 'redux-sink';

// use store to dispatch a location event, just like regular redux
SinkFactory.getStore().dispatch({ 
  type: 'navigation/loaction',
  payload: { pathname: '/' }
});

// get global state of the store
const state = SinkFactory.getStore().getState();
```
{% endtab %}
{% endtabs %}


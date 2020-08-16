---
description: configure sink store to enable features
---

# Store Configuration

### Use of SinkFactory.createStore

simple createStore will not include a trigger, effect trace, preloaded state

```javascript
const store = SinkFactory.createStore();
```

but the store can be configured by those through the creation

```javascript
const store = SinkFactory.createStore({
  reducers,               // redux reducers object
  preloadedState,         // preloaded state
  middlewares,            // middlewares array
  useEffectTrace,         // flag to enable effect trace
  useTrigger,             // flag to enable trigger
  devToolOptions          // dev tool options
});
```

for example to enable trigger and effect trace

```javascript
const store = SinkFactory.createStore({
  useEffectTrace: true,
  useTrigger: true
});
```

### Sink Store Configurations

```typescript
interface SinkConfiguration {
  // regular reducers
  reducers: { [key: string]: (state, action) => state },
  // predefined state
  preloadedState: { ...state },
  // additional middlewares
  middlewares: Array<ReduxMiddleware>,
  // use effect trace, default false
  useEffectTrace?: boolean;
  // use effect, default false
  useTrigger?: boolean;
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


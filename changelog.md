# Change Log

## \[0.17.0\] - 2020-04-16

* fix `useSink` potential performance issue

## \[0.15.0\] - 2019-12-17

* remove `getSinkConstructor` its not necessary

## \[0.14.4\] - 2019-12-17

* added `getSinkConstructor` to `SinkContainer`/`SinkFactory`, to get original class constructor without sink injections

## \[0.14.3\] - 2019-12-13

* fix optimization not working for unsubscribes

## \[0.14.0\] - 2019-12-12

* added subscriber logic to `useSink` and `sinking`, now able to choose which state will be subscribed
* the subscriber can use as `useSink(TestSink, sink => [sink.state1, sink.state2])`
* remove array sinking support to allowed subscriber parameter been added

## \[0.13.5\] - 2019-12-12

* added `MiddlewareServiceResult` for middleware service invoke result, to identify which value return for effect dispatch

## \[0.13.4\] - 2019-12-05

* added subscribe parameter to `useSink` default `true`, to tell if the component should subscribe on the sink, \(be able to modify the state only\)
* rename `utilities` folder to `utils`
* remove all dependencies, to allowed decide during development

## \[0.13.3\] - 2019-12-03

* push redux, react-redux to peerDependency to avoid duplicated ReactReduxContext not working with react-redux Provider

## \[0.13.0\] - 2019-09-24

### Update

* rename `SinkContainer.getTask` to `SinkContainer.getEffectTasks`
* rename store config `effectTrace` to `useEffectTrace`
* default store config `useTrigger` to `false`
* improve process of createStore

## \[0.12.5\] - 2019-08-05

### Fixed

* Server-side rendering fix

## \[0.12.3\] - 2019-08-05

### Fixed

* SinkBuilder with the inherited capability

## \[0.12.1\] - 2019-08-04

### Added

* added  `SinkContainer.invokeEffect`

### Update

* rename `SinkContainer.activateTrigger` to `SinkContainer.invokeTrigger`
* rename `SinkContainer.getEffectTasks` to `SinkContainer.getTasks`

### Fixed

* effect trace task error handling

## \[0.11.1\] - 2019-08-02

### Added

* effectTrace for store configuration to enable `SinkFactory.getEffectTasks` - default: false
* useTrigger for store configuration to enable trigger - default: true

### Update

* internal function names
* updated types for injections

## \[0.11.0\] - 2019-08-01

### Update

* update `SinkFactory.effectTasks` to `SinkFactory.getEffectTasks`
* update `SinkFactory.activeTrigger` to `SinkFactory.activateTrigger`

## \[0.10.1\] - 2019-07-30

### Fixed

* fix merge state with not defined state cause error

## \[0.9.0\] - 2019-07-30

### Update

* update sink injection to support another type rather than only Sink class
* replace `SinkFactory.sink` by `SinkFactory.getSink`

## \[0.8.1\] - 2019-07-28

### Added

* added dispatch action by set value on props

  ```jsx
  const Counter = () => {
  const counter = useSink(CounterSink);
  return (
    <div>
      <span>{counter.value}</span>
      <button onClick={() => counter.value++}>Add</button>
    </div>
  )
  }
  ```

* added raw action option for trigger

  ```jsx
  @sink('trigger')
  class Trigger {
  @trigger('counter/value', { rawAction })
  valueTrigger(action) {
    // action will contain { type, payload }
  }
  }
  ```

* added value formatter for the trigger, can format value before it hit the trigger

### Update

* lazyload fire trigger on default
* update `devtoolOptions` to `devToolOptions`

## \[0.7.1\] - 2019-07-28

### Update

* update internal payload to an array

## \[0.5.4\] - 2019-04-17

### Added

* support hook by `useSink`, require `react-redux: ^7.1.0`

### Fixed

* fix SinkFactory scope issue

## \[0.4.7\] - 2019-04-17

### Added

* able to use custom `redux-dev-tool` config when creating the store
* able to inject another sink through `@sink` by sink classes

### Fixed

* preloaded state check using `===` to avoid not defined checking

## \[0.3.0\] - 2019-04-15

### Fixed

* fixed issue sink may be loaded before a store
* fixed sink creates state without reducer config

## \[0.2.36\] - 2019-04-04

last version of `0.2.*`

### Added

* SinkFactory replace createStore function
* added capability to trigger an action after sink lazy-loaded

### Fixed

* array argument issue
* dispatch scope bug
* defined type with sink prototypes

## \[0.2.0\] - 2019-03-18

### Added

* Trigger, TriggerMiddleware

### Fixed

* way to get sink prototype 
* type match issues
* trigger with normal redux actions

### Removed

* dependency of redux-dev-tool

## \[0.1.0\] - 2019-03-14

* initial release
* use sink by configuring the store

### Fixed

* fix merge state with not defined state cause error

## \[0.9.0\] - 2019-07-30

### Update

* update sink injection to support other types rather than only Sink class
* replace `SinkFactory.sink` by `SinkFactory.getSink`

## \[0.8.1\] - 2019-07-28

### Added

* added dispatch action by set value on props

  ```jsx
  const Counter = () => {
  const counter = useSink(CounterSink);
  return (
    <div>
      <span>{counter.value}</span>
      <button onClick={() => counter.value++}>Add</button>
    </div>
  )
  }
  ```

* added raw action option for trigger

  ```jsx
  @sink('trigger')
  class Trigger {
  @trigger('counter/value', { rawAction })
  valueTrigger(action) {
    // action will contain { type, payload }
  }
  }
  ```

* added value formatter for a trigger, can format value before it hit a trigger

### Update

* lazyload fire trigger on default
* update `devtoolOptions` to `devToolOptions`

## \[0.7.1\] - 2019-07-28

### Update

* update internal payload to an array

## \[0.5.4\] - 2019-04-17

### Added

* support hook by `useSink`, require `react-redux: ^7.1.0`

### Fixed

* fix SinkFactory scope issue

## \[0.4.7\] - 2019-04-17

### Added

* able to use custom `redux-dev-tool` config when creating the store
* able to inject another sink through `@sink` by sink classes

### Fixed

* preloaded state check using `===` to avoid not defined checking

## \[0.3.0\] - 2019-04-15

### Fixed

* fixed issue sink may be loaded before the store
* fixed sink creates state without reducer config

## \[0.2.36\] - 2019-04-04

last version of `0.2.*`

### Added

* SinkFactory replace createStore function
* added capability to trigger an action after sink lazy-loaded

### Fixed

* array argument issue
* dispatch scope bug
* defined type with sink prototypes

## \[0.2.0\] - 2019-03-18

### Added

* Trigger, TriggerMiddleware

### Fixed

* way to get sink prototype 
* type match issues
* trigger with normal redux actions

### Removed

* dependency of redux-dev-tool

## \[0.1.0\] - 2019-03-14

* initial release
* use sink by configuring the store


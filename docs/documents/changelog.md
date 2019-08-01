# Change Log

## \[0.10.1\] - 2019-07-30

## \[0.10.1\] - 2019-07-30

### Fixed

* fix merge state with undefined state cause error

## \[0.9.0\] - 2019-07-30

### Update

* update sink injection to support other type rather than only Sink class
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

* added value formatter for trigger, can format value before it hit trigger

### Update

* lazy load fire trigger on default
* update `devtoolOptions` to `devToolOptions`

## \[0.7.1\] - 2019-07-28

### Update

* update internal payload to array

## \[0.5.4\] - 2019-04-17

### Added

* support hook by `useSink`, require `react-redux: ^7.1.0`

### Fixed

* fix SinkFactory scope issue

## \[0.4.7\] - 2019-04-17

### Added

* able to use custom `redux-dev-tool` config when create store
* able to inject other sink through `@sink` by sink classes

### Fixed

* preloaded state check using `===` to avoid undefined checking

## \[0.3.0\] - 2019-04-15

### Fixed

* fixed issue sink may loaded before store
* fixed sink creates state without reducer config

## \[0.2.36\] - 2019-04-04

last version of `0.2.*`

### Added

* SinkFactory replace createStore function
* added capability to trigger action after sink lazy loaded

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
* use sink by configure store

### Fixed

* fix merge state with undefined state cause error

## \[0.9.0\] - 2019-07-30

### Update

* update sink injection to support other type rather than only Sink class
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

* added value formatter for trigger, can format value before it hit trigger

### Update

* lazy load fire trigger on default
* update `devtoolOptions` to `devToolOptions`

## \[0.7.1\] - 2019-07-28

### Update

* update internal payload to array

## \[0.5.4\] - 2019-04-17

### Added

* support hook by `useSink`, require `react-redux: ^7.1.0`

### Fixed

* fix SinkFactory scope issue

## \[0.4.7\] - 2019-04-17

### Added

* able to use custom `redux-dev-tool` config when create store
* able to inject other sink through `@sink` by sink classes

### Fixed

* preloaded state check using `===` to avoid undefined checking

## \[0.3.0\] - 2019-04-15

### Fixed

* fixed issue sink may loaded before store
* fixed sink creates state without reducer config

## \[0.2.36\] - 2019-04-04

last version of `0.2.*`

### Added

* SinkFactory replace createStore function
* added capability to trigger action after sink lazy loaded

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
* use sink by configure store

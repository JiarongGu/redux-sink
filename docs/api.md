
# @redux-sink Api References
- [@redux-sink Api References](#redux-sink-api-references)
  - [@sink](#sink)
  - [@state](#state)
  - [@effect](#effect)
  - [@trigger](#trigger)
  - [SinkContainer](#sinkcontainer)
  - [SinkFactory](#sinkfactory)
  - [SinkBuilder](#sinkbuilder)
  - [Sink](#sink)

## @sink
mark the class as redux-sink class, the sink name use to locate the sink in store

## @state
configure state property, state will be sync when reducer updates the store state, inital state created based on this property or preloadedState from store. you can have multiple states

## @effect
use to process side-effects and async calls, will run inside effect middleware

## @trigger
use to bind extra event when action fires

## SinkContainer
main registry class for sinks, dynamic reducer controls

## SinkFactory
default registry instance of SinkContainer for default globals use

## SinkBuilder
build class embedded inside sink's prototype, collect the sink configuration

## Sink
main sink prototype class build sink instance in `SinkContainer`
# API Refernces

* [@sink](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#sink)
* [@state](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#state)
* [@effect](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#effect)
* [@trigger](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#trigger)
* [SinkContainer](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#sinkcontainer)
* [SinkFactory](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#sinkfactory)
* [SinkBuilder](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#sinkbuilder)
* [Sink](https://github.com/JiarongGu/redux-sink/tree/331cba56b9ec95460241a12d0c3435b8d846da2c/docs/apireference.md#sink)

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


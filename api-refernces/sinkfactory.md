---
description: default SinkContainer scope
---

# SinkFactory

`SinkFactory` is default `SinkContainer` the object which used globally. when using `sinking` and `useSink` to connect sink with components, all the sink objects will be generated from SinkFactory

## SinkFactory vs SinkContainer

Normally in a single project should use `SinkFactory` and `SinkContainer` for testing, also when using it `SinkFactory` can be directly used because it is a `SinkCotainer` Instance. but `SinkContainer` is a constructor.

```javascript
import { SinkFactory, SinkContainer } from 'redux-sink';
import { CounterSink } from './CounterSink';

const store = SinkFactory.creatStore();

// creat a clean store by a new container
const container = new SinkContainer();
const testStore = container.creatStore();

// this will create a sink inside container instead of SinkFactory
const counter = container.getSink(CounterSink);
```

## createStore\(SinkConfiguration\) =&gt; Store

see [SinkContainer.createStore](sinkcontainer.md#createstore-storeconfiguration-greater-than-store)

## getSink\(SinkClass\) =&gt; SinkInstance

see [SinkContainer.getSink](sinkcontainer.md#getsink-sinkclass-greater-than-sinkinstance)

## getTasks\(\) =&gt; Array&lt;Promise&gt;

see [SinkContainer.getTasks](sinkcontainer.md#geteffecttasks-greater-than-array-less-than-promise-greater-than)

## getStore\(\) =&gt; Store

see [SinkContainer.getStore](sinkcontainer.md#getstore-greater-than-store)


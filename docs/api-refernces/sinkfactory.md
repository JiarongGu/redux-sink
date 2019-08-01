---
description: default SinkContainer scope
---

# SinkFactory

`SinkFactory` is default `SinkContainer` object which used globally. when using `sinking` and `useSink` to connect sink with component, all the sink objects will be generated from SinkFactory

### SinkFactory vs SinkContainer

Normally in project should use `SinkFactory` and `SinkContainer` for testing, also when using it `SinkFactory` can be detectly used because it is a `SinkCotainer` Instance. but `SinkContainer` is a constructor.

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

### createStore

see [SinkContainer](sinkcontainer.md#createstore)

### getSink

see [getSink](sinkcontainer.md#getsink)


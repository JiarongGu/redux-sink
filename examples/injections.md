---
description: >-
  Sinks also support injections to its constructor, for better testing and other
  purpose.
---

# Injections

It is possible to inject from `@sink` decorator, to decouple the relations for sinks

### Inject sink class

Injected sink class will automatically transfer in to sink instance.

```javascript
import { sink, state, effect } from 'redux-sink';

// shop sink to manage state of all products
@sink('shop')
export class ShopSink {
  @state products = [];
  @state loaded = false;

  @effect
  async function loadProducts() {
    this.products = await fetch('http://api/products');
    this.loaded = true; 
  }
}

// product sink to control current displaied product
// getting the data from ShopSink based on ShopSink.loaded
@sink('product', ShopSink)
export class ProductSink {
  @state product;
  
  constructor(shopSink) {
    this.shopSink = shopSink;
  }
  
  @effect
  async function loadProduct(id) {
    if(!this.shopSink.loaded) {
      await this.shopSink.loadProducts();
    }
    this.product = this.shopSink.products.find(x => x.id === id);
  }
}
```

### Inject SinkFactory

there is a chance that injecting class will not work due to [decorators don't work when there circular references](https://github.com/Microsoft/TypeScript/issues/4521), there are workarounds, but not simplified to be solved because `redux-sink` does not use `reflect-metadata`, and `redux-sink` provide object injection.

```javascript
import { sink, state, SinkFactory } from 'redux-sink';

// instead of injecting the SinkClass we can inject the SinkFactory
// this can work same as injecting the SinkClass
// and test the sink with mock container
@sink('product', SinkFactory)
export class ProductSink {
  @state product;
  
  constructor(factory) {
    this.shopSink = factory.getSink(ShopSink);
  }
}
```

### Inject other objects

because all `Sink` use `SinkContainer` to create the instance, so we normally cannot access the constructor arguments, so we provide a way to inject other objects.

```javascript
import { sink, state } from 'redux-sink';

const product = { title: 'test', price: 15 };

// injecting default product value to sink
@sink('product', product)
export class ProductSink {
  @state product;
  
  constructor(product) {
    this.product = product;
  }
}
```


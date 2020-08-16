---
description: '@trigger is used to trigger when effect or state dispatch fires'
---

# @trigger

### @trigger\(action, options?\)

{% tabs %}
{% tab title="Arguments" %}
```typescript
// The action name will be `{sink}/{effect|state}`
type action = string

interface options {
  // trigger excution order, default 0
  priority?: number;
  // lazy loaded trigger will excute after action, default true
  lazyLoad?: boolean;
  // pass raw action object to trigger function, default false
  rawAction?: boolean;
  // formatter use to arguments before it hits trigger function
  formatter?: Function;
}
```
{% endtab %}

{% tab title="Example" %}
```javascript
import { sink, state, effect } from 'redux-sink';

@sink('weather')
export class WeatherSink {
  @state humidity = 0;
  @state weather = { 
    temperature: 0,
    humidity: 0
  };
  
  // when weather action dispatches, set humidity as same as weather
  @trigger('weather/weather', { formatter: (weather) => weather.humidity })
  function weatherTrigger(humidity ) {
    this.humidity = humidity;
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
the trigger is a powerful tool for make redux as an event sourcing system, but may cause infinity loop to redux actions when setting bad triggers, be careful when using it
{% endhint %}


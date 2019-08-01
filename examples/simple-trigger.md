---
description: Trigger will be called when matched action dispatches
---

# Simple Trigger

### Create sink with trigger

{% code-tabs %}
{% code-tabs-item title="WeatherSink.js" %}
```javascript
import { sink, state, effect } from 'redux-sink';

@sink('weather')
export class WeatherSink {
  @state loading = false;
  @state weather = { 
    temperature: 0,
    humidity: 0
  };

  @effect
  async function loadWeather() {
    this.loading = true;
    this.weather = async fetch('http://api/weather');
  }
  
  // when weather action dispatches, set loading back to false
  @trigger('weather/weather')
  function weatherTrigger(weather) {
    this.loading = false;
  }
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}


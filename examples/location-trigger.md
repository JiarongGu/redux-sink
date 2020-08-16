---
description: Create Trigger based on location change action
---

# Location Trigger

This is advanced trigger usage requires to use something like [`NavigationSink`](navigation-sink.md), the trigger watches on `navigation/location` action to update sink state

### Create sink with a location trigger

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
    this.loading = false;
  }
  
  @trigger('navigation/location')
  function locationTrigger(location) {
    if(location.pathname === '/weather') {
      this.loadWeather();
    }
  }
}
```

on location change to `/weather` this sink will fire a `loadWeather` the event, to use this so we don't need to call effect inside the component life cycle event


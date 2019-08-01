---
description: create sink on history event to watch location change
---

# Navigation Sink

### Create Navigation Sink with BrowserHistory

{% code-tabs %}
{% code-tabs-item title="NavigationSink.js" %}
```javascript
import { state, sink, effect, SinkFactory } from 'redux-sink';
import { createBrowserHistory } from 'history';

@sink('navigation')
export class NavigationSink {
  @state history: History;
  @state location: Location;
}

// create browser history and listen location change to update sink
export const createNavigationHistory = () => {
  const history = createBrowserHistory();
  const navigation = SinkFactory.getSink(NavigationSink);

  history.listen((location) => navigation.location = location);
  navigation.history = history;
  navigation.location = history.location;
  return history;
}
```
{% endcode-tabs-item %}
{% endcode-tabs %}

### Supply the navigation history object to router

{% code-tabs %}
{% code-tabs-item title="index.jsx" %}
```jsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { SinkFactory } from 'redux-sink';

import { createNavigationHistory } from './NavigationSink';
import { App } from './App';

const store = SinkFactory.createStore();
const history = createNavigationHistory();

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
);
```
{% endcode-tabs-item %}
{% endcode-tabs %}


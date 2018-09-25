# Rory

You don't need to create a redux-like singleton to manage your application state. Use small objects instead!

## Install

```
npm install --save rory
```

## Getting started

Imagine that we use [@babel/plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties) 
and one of the parts of our application is the simple counter shown below:

```js
// Counter.js
export default class Counter {
  _count = 0

  increase = () => this._count += 1

  decrease = () => this._count -= 1
}
```

We want to present this counter using React component:
```js
// CounterComponent.jsx
import React from 'react'

export default ({ count, onClickPlus, onClickMinus }) => (
  <div>
    <p>{count}</p>
    <button onClick={onClickMinus}>-</button><button onClick={onClickPlus}>+</button>
  </div>
)
```

And we also want to present the counter using Dashboard:
```js
// CounterDashboard.jsx
import React from 'react'

export default ({ count }) => (
  <h1>{count}</h1>
)
```

Rory can breathe a life to this React components. Edit `Counter.js`:
```js
// Counter.js
import Rory from 'rory'
import CounterComponent from './CounterComponent'
import CounterDashboard from './CounterDashboard'

export default class Counter extends Rory {
  _count = 0

  increase = this.act(() => this._count += 1)

  decrease = this.act(() => this._count -= 1)

  asComponent = this.link(CounterComponent, () => ({
    count: this._count,
    onClickPlus: this.increase,
    onClickMinus: this.decrease,
  }))

  asDashboard = this.link(CounterDashboard, () => ({
    count: this._count,
  }))
}
```

Lets use our lively components:
```js
// App.js
import React from 'react';
import Counter from './Counter';

export default class App extends React.Component {
  render() {
    const counter = new Counter();
    return (
      <div>
       {counter.asDashboard()}
       {counter.asComponent()}
      </div>
    )
  }
}
```

Here is a result:
<img src="https://rawgit.com/Telichkin/otp_cheatsheet/master/pictures/counter.gif">

You can also play with example in [repl.it](https://repl.it/@Telichkin/RoryCounter)
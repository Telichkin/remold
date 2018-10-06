# Remold

Remold is extra small (~500B minified and gzipped) object-oriented 
alternative to the popular libraries for state-management such as
 Redux, or Mobx. With Remold you no longer need to create a redux-like 
 singleton, fight with boilerplate, and overuse primitives. Instead, 
 you can reuse your domain-specific objects.


## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Rationale](#rationale)

## Installation

Remold requires **React 15.0 or later.**
```
npm install --save remold
```


## Getting Started

Every object which wants to be represented as a React component 
has to inherit from `Remold` class:
```js
import { Remold } from 'remold'

export default class Counter extends Remold {
  count = 0
}
```

Every method which can modify object's state has to be decorated with `act`:
```js
import { Remold, act } from 'remold'

export default class Counter extends Remold {
  count = 0
  
  @act increase() { this.count += 1 }
  
  @act decrease() { this.count -= 1 }
}
```

Every method which connects a React component to an object has
to be decorated with `mold(aComponent)`:
```js
import React from 'react'
import { Remold, act, mold } from 'remold'

const CounterView = ({ count, onPlus, onMinus }) => (
  <div>
    <p>{count}</p>
    <button onClick={onMinus}>-</button>
    <button onClick={onPlus}>+</button>
  </div>
)

export default class Counter extends Remold {
  count = 0
  
  @act increase() { this.count += 1 }
  
  @act decrease() { this.count -= 1 }
  
  @mold(CounterView) asView() {
    return {
      count: this.count,
      onPlus: this.increase,
      onMinus: this.decrease,
    }
  }
}
```

The methods decorated with `mold(aComponent)` returns an instance
 of the React component:
```js
import React from 'react'
import Counter from './Counter'

const counter = new Counter()

const App = () => (
  <div>
    {counter.asView()}
  </div>
)
```

### Notes
 - Both `act` and `mold(aComponent)` decorators bound decorated method
 - Every molded component has a unique `key` prop, so you don't need 
 to manage this prop manually 

## Rationale

The dominant part of our frontend-applications represents a visual 
description of domain-specific objects. However, modern libraries push 
us away from objects, so we have to reinvent the wheel, overuse primitives, 
and write procedural code which mutates one global store. 

Let's look 
at the [Facebook 'chat problem'](https://youtu.be/nYkdrAPrdcw?t=789).
According to this problem, our app should:
1. increment unseen thread count
2. append message in the chat tab
3. if open, append message in the main messages view
4. if the chat tab is focused or the main messages view is open, 
decrement the unseen count

Solving this problem, Facebook reinvented the Object-Oriented 
Programming and gave it the name 'Flux.'

 Flux | OOP 
------|-----
Action | Method name (selector)
Dispatcher | Object
Store | Object's internal state

Remold embraces OOP and doesn't add new abstractions. With Remold a solution to this problem can be simple and straightforward. 
Firstly, we have to represent our domain with objects:

```
Chat -> Threads -> Messages
```

```js
// Domain.js
export class Chat {
  // Initialisation is here
  
  markThreadAsSeen(aThread) {
    aThread.markAsSeen()
  }
  
  get unseenThreadsCount() {
    return this.unseenThreads.length
  }
  
  get unseenThreads() {
    return this._threads.filter(t => t.isUnseen())
  }
  
  addMessage(aMessage, { toThread: aThread }) {
    aThread.addMessage(aMessage)
  }
}

export class Thread {
  // Initialisation is here
  
  isUnseen() {
    return this.unseenMessages.length > 0
  }
  
  markAsSeen() {
    this.unseenMessages.forEach(m => m.markAsSeen())
  }
  
  get unseenMessages() {
    return this._messages.filter(m => m.isUnseen())
  }
  
  addMessage(aMessage) {
    this._messages.push(aMessage)
  }
}

export class Message {
  // Initialisation is here
  
  isUnseen() {
    return this._unseen
  }
  
  markAsSeen() {
    this._unseen = false
  }
}
```

Our domain is ready, and we have to visualize it using React components:
```js
// Components.jsx
import React from 'react'

export const Counter = ({ count }) => (
  // Component markup
)

export const MessageView = ({ content, isUnseen }) => (
  // Component markup
)

export const ChatTab = ({ messages, onFocus }) => (
  // Component markup
)

export const MainMessagesView = ({ messages, onOpen }) => (
  // Component markup
)

export const SmallChatView = ({ threads }) => (
  // Component markup
)
```

As the last step we need to connect components to domain objects:
```js
//Domain.js
import { Remold, mold, act } from 'remold'
import { 
  Counter, MessageView, ChatTab, 
  MainMessagesView, SmallChatView 
} from './Components'

export class Chat extends Remold {
  // Initialisation is here
  
  @act markThreadAsSeen(aThread) {
    aThread.markAsSeen()
  }
  
  get unseenThreadsCount() {
    return this.unseenThreads.length
  }
  
  get unseenThreads() {
    return this._threads.filter(t => t.isUnseen())
  }
  
  @act addMessage(aMessage, { toThread: aThread }) {
    aThread.addMessage(aMessage)
  }
  
  @mold(Counter) asCounter() {
    return {
      count: this.unseenThreadsCount,
    }
  }
  
  @mold(SmallChatView) asSmallView() {
    return {
      threads: this._threads.map(t => t.asChatTab({ 
        onFocus: () => this.markThreadAsSeen(t) 
      })),
    }
  }
}

export class Thread extends Remold {
  // Initialisation is here
  
  isUnseen() {
    return this.unseenMessages.length > 0
  }
  
  @act markAsSeen() {
    this.unseenMessages.forEach(m => m.markAsSeen())
  }
  
  get unseenMessages() {
    return this._messages.filter(m => m.isUnseen())
  }
  
  @act addMessage(aMessage) {
    this._messages.push(aMessage)
  }
  
  @mold(ChatTab) asChatTab({ onFocus }) {
    return {
      messages: this.messagesView,
      onFocus,
    }
  }
  
  @mold(MainMessagesView) asMainMessagesView({ onOpen }) {
    return {
      messages: this.messagesView,
      onOpen,
    }
  }
  
  get messagesView() {
    return this._messages.map(m => m.asView())
  }
}

export class Message extends Remold {
  // Initialisation is here
  
  isUnseen() {
    return this._unseen
  }
  
  @act markAsSeen() {
    this._unseen = false
  }
  
  @mold(MessageView) asView() {
    return {
      content: this._content,
      isUnseen: this.isUnseen(),
    }
  }
}
```

That's it. Now we can use the chat in different places of our application:
```js
// App.jsx
import React from 'react';
import { Chat } from './Domain'
import { Header, Body } from './Somewhere'

const chat = new Chat()

export const App = () => (
  <div>
    <Header threadsCounter={chat.asCounter()}/>
    <Body smallChat={chat.asSmallView()}/>
  </div>
)
```

Now we have all visualization of domain objects in a single place. 
If you want to visualize message as a preview, add new mold method into
message object:
```js
export class Message extends Remold {
  // ...
  @mold(MessagePreview) asPreview() {
    return {
      content: this._content
    }
  }
}
```

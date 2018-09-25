import { Component, createElement } from 'react'
import Id from './Id'

export default class Remold {
  _id = Id.of(this)
  _subscribers = []
  _moldComponents = new WeakMap()

  id = () => this._id

  mold = (aComponent, aPropsMapping) => (...args) => {
    if (!this._moldComponents.has(aComponent)) {
      this._moldComponents.set(aComponent, this._createMoldComponent(aComponent, aPropsMapping))
    }
    return createElement(this._moldComponents.get(aComponent), { args })
  }

  _createMoldComponent = (aComponent, aPropsMapping) => {
    const self = this
    return class extends Component {
      static displayName = 'Molded' + aComponent.name
      render = () => createElement(aComponent, aPropsMapping.apply(self, this.props.args))
      componentWillMount = () => self.subscribe(this)
      componentWillUnmount = () => self.unsubscribe(this)
    }
  }

  subscribe = (aComponent) => this._subscribers.push(aComponent)

  unsubscribe = (aComponent) => this._subscribers = this._subscribers.filter(s => s !== aComponent)

  act = (aFunction) => (...args) => {
    const result = aFunction.apply(this, args)
    this._subscribers.forEach(l => l.forceUpdate())
    return result
  }
}
import { Component, createElement } from 'react'
import Id from './Id'

export default class Remold {
  _id = Id.of(this)
  _subscribers = []
  _moldedComponents = new WeakMap()

  id = () => this._id

  mold = (aComponent, aPropsMapping) => (...args) => {
    if (!this._moldedComponents.has(aComponent)) {
      this._moldedComponents.set(aComponent, this._createMoldedComponent(aComponent, aPropsMapping))
    }
    return createElement(this._moldedComponents.get(aComponent), { args })
  }

  _createMoldedComponent = (aComponent, aPropsMapping) => {
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
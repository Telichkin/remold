'use strict'

var React = require('react')
var _id = 0

function Remold() {
  this._id = (_id++).toString()
  this._subscribers = []
  this._moldedComponents = new WeakMap()
}

Remold.prototype.id = function () { return this._id }

Remold.prototype.mold = function (aComponent, aPropsMapping) {
  var mold = function () {
    if (!this._moldedComponents.has(aComponent)) {
      this._moldedComponents.set(aComponent, this._createMoldedComponent(aComponent, aPropsMapping))
    }
    return React.createElement(
      this._moldedComponents.get(aComponent),
      { args: arguments, key: aComponent.name + '-' + this.id() })
  }
  return mold.bind(this)
}

Remold.prototype._createMoldedComponent = function (aComponent, aPropsMapping) {
  var self = this

  function Molded(props) {
    React.PureComponent.call(this, props)
    this.state = this.newState()
  }
  Molded.displayName = 'Molded' + aComponent.name
  Molded.prototype = Object.create(React.PureComponent.prototype)
  Molded.prototype.newState = function () { return aPropsMapping.apply(self, this.props.args) }
  Molded.prototype.render = function () { return React.createElement(aComponent, this.state) }
  Molded.prototype.componentWillMount = function () { self.subscribe(this) }
  Molded.prototype.componentWillUnmount = function () { self.unsubscribe(this) }
  Molded.prototype.update = function () { this.setState(this.newState()) }
  return Molded
}

Remold.prototype.subscribe = function (aComponent) { this._subscribers.push(aComponent) }

Remold.prototype.unsubscribe = function (aComponent) {
  this._subscribers = this._subscribers.filter(function (s) { return s !== aComponent })
}

Remold.prototype.act = function (aFunction) {
  var act = function () {
    var result = aFunction.apply(this, arguments)
    for (var i = 0; i < this._subscribers.length; i++) { this._subscribers[i].update() }
    return result
  }
  return act.bind(this)
}

module.exports = Remold
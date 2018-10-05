'use strict'

var React = require('react')
var _id = 0

function Remold () {
  this.__REMOLD_ID__ = (_id++).toString()
  this.__REMOLD_SUBSCRIBERS__ = []
  this.__REMOLD_MOLDED__ = new WeakMap()
}

Remold.prototype.__REMOLD_CREATE_COMPONENT__ = function (aComponent, aPropsMapping) {
  var self = this
  Molded.prototype = Object.create(React.Component.prototype)
  function Molded(props) { React.Component.call(this, props) }
  Molded.displayName = 'Molded' + aComponent.name
  Molded.prototype.newProps = function () { return aPropsMapping.apply(self, this.props.args) }
  Molded.prototype.render = function () { return React.createElement(aComponent, this.newProps()) }
  Molded.prototype.componentWillMount = function () { self.__REMOLD_SUBSCRIBE__(this) }
  Molded.prototype.componentWillUnmount = function () { self.__REMOLD__UNSUBSCRIBE__(this) }
  Molded.prototype.update = function () { this.forceUpdate() }
  return Molded
}

Remold.prototype.__REMOLD_SUBSCRIBE__ = function (aComponent) { this.__REMOLD_SUBSCRIBERS__.push(aComponent) }

Remold.prototype.__REMOLD__UNSUBSCRIBE__ = function (aComponent) {
  this.__REMOLD_SUBSCRIBERS__ = this.__REMOLD_SUBSCRIBERS__.filter(function (s) { return s !== aComponent })
}

function act(t, name, descr) {
  var method = descr.value
  var newMethod = function () {
    var result = method.apply(this, arguments)
    for (var i = 0; i < this.__REMOLD_SUBSCRIBERS__.length; i++) { this.__REMOLD_SUBSCRIBERS__[i].update() }
    return result
  }
  return {
    get: function () {
      var bound = newMethod.bind(this)
      Object.defineProperty(this, name, { value: bound })
      return bound
    }
  }
}

function mold(aComponent) {
  return function (t, n, descr){
    var method = descr.value
    descr.value = function () {
      if (!this.__REMOLD_MOLDED__.has(aComponent)) {
        this.__REMOLD_MOLDED__.set(aComponent, this.__REMOLD_CREATE_COMPONENT__(aComponent, method.bind(this)))
      }
      return React.createElement(
        this.__REMOLD_MOLDED__.get(aComponent),
        { args: arguments, key: aComponent.name + '-' + this.__REMOLD_ID__ })
    }
    return descr
  }
}

module.exports = { Remold: Remold, act: act, mold: mold }

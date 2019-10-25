'use strict'

var React = require('react')
var _id = Number.MIN_SAFE_INTEGER

function Remold () {
  this.__REMOLD_ID__ = (_id++).toString()
  this.__REMOLD_SUBSCRIBERS__ = []
  this.__REMOLD_MOLDED__ = new WeakMap()
  self.__REMOLD_UPDATE_SCHEDULED__ = false
}

Remold.prototype.__REMOLD_CREATE_COMPONENT__ = function (aComponent, aPropsMapping) {
  var self = this
  Molded.prototype = Object.create(React.Component.prototype)
  function Molded(props) { React.Component.call(this, props) }
  Molded.displayName = 'Molded' + aComponent.name
  Molded.prototype.newProps = function () { return aPropsMapping.apply(self, this.props.args) }
  Molded.prototype.render = function () { return React.createElement(aComponent, this.newProps()) }
  Molded.prototype.componentWillMount = function () { self.__REMOLD_SUBSCRIBE__(this) }
  Molded.prototype.componentWillUnmount = function () { self.__REMOLD_UNSUBSCRIBE__(this) }
  Molded.prototype.update = function () { this.forceUpdate() }
  return Molded
}



Remold.prototype.__REMOLD_SUBSCRIBE__ = function (aComponent) { this.__REMOLD_SUBSCRIBERS__.push(aComponent) }

Remold.prototype.__REMOLD_UNSUBSCRIBE__ = function (aComponent) {
  this.__REMOLD_SUBSCRIBERS__ = this.__REMOLD_SUBSCRIBERS__.filter(function (s) { return s !== aComponent })
}

var act = methodDecorator(function (method) {
  return function () {
    var self = this
    var result = method.apply(self, arguments)
    if (!self.__REMOLD_UPDATE_SCHEDULED__) {
      window.requestAnimationFrame(function() {
        for (var i = 0; i < self.__REMOLD_SUBSCRIBERS__.length; i++) { self.__REMOLD_SUBSCRIBERS__[i].update() }
        self.__REMOLD_UPDATE_SCHEDULED__ = false
      })
      self.__REMOLD_UPDATE_SCHEDULED__ = true
    }
    return result
  }
})

function mold(aComponent) {
  return methodDecorator(function (method){
    return function () {
      if (!this.__REMOLD_MOLDED__.has(aComponent)) {
        this.__REMOLD_MOLDED__.set(aComponent, this.__REMOLD_CREATE_COMPONENT__(aComponent, method.bind(this)))
      }
      return React.createElement(
        this.__REMOLD_MOLDED__.get(aComponent),
        { args: arguments, key: aComponent.name + '-' + this.__REMOLD_ID__ })
    }
  })
}

function methodDecorator(aFunction) {
  return function (t, name, descr) {
    var newMethod = aFunction(descr.value)
    return {
      get: function () {
        var bound = newMethod.bind(this)
        Object.defineProperty(this, name, { value: bound })
        return bound
      }
    }
  }
}

module.exports = { Remold: Remold, act: act, mold: mold }

'use strict'

var React = require('react')
var _id = 0

function remold(aClass) {
  Remold.prototype = Object.create(aClass.prototype)
  function Remold () {
    aClass.apply(this, arguments)
    this.__REMOLD_ID__ = (_id++).toString()
    this.__REMOLD_SUBSCRIBERS__ = []
    this.__REMOLD_MOLDED__ = new WeakMap()
  }

  Remold.prototype.id = function () { return this.__REMOLD_ID__ }

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
  return Remold
}

function act(t, n, descr) {
  var method = descr.value
  descr.value = function () {
    var result = method.apply(this, arguments)
    for (var i = 0; i < this.__REMOLD_SUBSCRIBERS__.length; i++) { this.__REMOLD_SUBSCRIBERS__[i].update() }
    return result
  }
  return descr
}

function mold(aComponent) {
  return function (t, n, descr){
    var method = descr.value
    descr.value = function () {
      if (!this.__REMOLD_MOLDED__.has(aComponent)) {
        this.__REMOLD_MOLDED__.set(aComponent, this.__REMOLD_CREATE_COMPONENT__(aComponent, method))
      }
      return React.createElement(
        this.__REMOLD_MOLDED__.get(aComponent),
        { args: arguments, key: aComponent.name + '-' + this.id() })
    }
    return descr
  }
}

module.exports = { remold: remold, act: act, mold: mold }
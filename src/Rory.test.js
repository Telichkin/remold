import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Rory from './Rory'

Enzyme.configure({ adapter: new Adapter() })

test('Should have unique id', () => {
  const first = new Rory(), second = new Rory()

  expect(first.id()).not.toBe(second.id())
})

describe('Rory subclass', () => {
  class User extends Rory {
    name = 'Rory'

    changeNameTo = this.act((aName) => this.name = aName)

    asCard = this.link(UserCard, (postfix) => ({ name: this.name, postfix }))
    asTitle = this.link(UserTitle, () => ({ name: this.name }))
  }

  const UserCard = ({ name, postfix = '' } = {}) => <p>{name}{postfix}</p>
  class UserTitle extends React.Component { render = () => <h1>{this.props.name.toUpperCase()}</h1> }

  const user = new User()
  const mountedCard = mount(user.asCard())
  const mountedTitle = mount(user.asTitle())

  test('Should pass props into linked component', () => {
    expect(mountedCard.text()).toBe('Rory')
    expect(mountedTitle.text()).toBe('RORY')
  })

  test('Should pass additional props from arguments', () => {
    const mountedCardWithPostfix = mount(user.asCard('Cool'))

    expect(mountedCardWithPostfix.text()).toBe('RoryCool')
  })

  test('Should reuse already created linked component', () => {
    const firstCard = user.asCard(), secondCard = user.asCard()

    expect(firstCard.type).toBe(secondCard.type)
  })

  test('Should rename linked component', () => {
    expect(mountedCard.name()).toBe('LinkedUserCard')
    expect(mountedTitle.name()).toBe('LinkedUserTitle')
  })

  test('Links should be rerendered after changes', () => {
    user.changeNameTo('New Rory')

    expect(mountedCard.text()).toBe('New Rory')
    expect(mountedTitle.text()).toBe('NEW RORY')
  })

  test('Links should not be rerendered after unmount', () => {
    let errorWasCalled = false
    console.error = () => errorWasCalled = true

    mountedCard.unmount()
    user.changeNameTo('New Rory')

    expect(errorWasCalled).toBeFalsy()
  })
})
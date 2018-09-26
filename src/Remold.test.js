import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Remold from './Remold'

Enzyme.configure({ adapter: new Adapter() })

test('Should have unique id', () => {
  const first = new Remold(), second = new Remold()

  expect(first.id()).not.toBe(second.id())
})

describe('Remold subclass', () => {
  class User extends Remold {
    name = 'Remold'
    age = 1

    changeNameTo = this.act((aName) => this.name = aName)

    asCard = this.mold(UserCard, (postfix) => ({ name: this.name, postfix }))
    asTitle = this.mold(UserTitle, () => ({ name: this.name }))
  }

  const UserCard = ({ name, postfix = '' } = {}) => <p>{name}{postfix}</p>
  class UserTitle extends React.Component { render = () => <h1>{this.props.name.toUpperCase()}</h1> }

  let user, mountedCard, mountedTitle;

  beforeEach(() => {
    user = new User()
    mountedCard = mount(user.asCard())
    mountedTitle = mount(user.asTitle())
  })

  test('Should pass props into linked component', () => {
    expect(mountedCard.text()).toBe('Remold')
    expect(mountedTitle.text()).toBe('REMOLD')
  })

  test('Should pass additional props from arguments', () => {
    const mountedCardWithPostfix = mount(user.asCard('Cool'))

    expect(mountedCardWithPostfix.text()).toBe('RemoldCool')
  })

  test('Should reuse already created linked component', () => {
    const firstCard = user.asCard(), secondCard = user.asCard()

    expect(firstCard.type).toBe(secondCard.type)
  })

  test('Should rename linked component', () => {
    expect(mountedCard.name()).toBe('MoldedUserCard')
    expect(mountedTitle.name()).toBe('MoldedUserTitle')
  })

  test('Molds should be rerendered after changes', () => {
    user.changeNameTo('New Remold')

    expect(mountedCard.text()).toBe('New Remold')
    expect(mountedTitle.text()).toBe('NEW REMOLD')
  })

  test('Molds should not be rerendered after unmount', () => {
    let errorWasCalled = false
    console.error = () => errorWasCalled = true

    mountedCard.unmount()
    user.changeNameTo('New Remold')

    expect(errorWasCalled).toBeFalsy()
  })

  test('Mold should be rerendered after changes in the state only', () => {
    let renderCalledTimes = 0
    const ageComponent = ({ age }) => {
      renderCalledTimes += 1
      return <p>{age}</p>
    }
    const asAge = user.mold(ageComponent, () => ({
      age: user.age,
    }))
    const mountedAge = mount(asAge())

    user.changeNameTo('New Name')

    expect(renderCalledTimes).toBe(1)
  })

  test('Mold should have key', () => {
    expect(user.asCard().key).toBe('UserCard-' + user.id())
  })
})
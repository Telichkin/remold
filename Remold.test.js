import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { remold, act, mold } from './Remold'

Enzyme.configure({ adapter: new Adapter() })

const UserCard = ({ name, postfix = '' } = {}) => <p>{name}{postfix}</p>
class UserTitle extends React.Component { render = () => <h1>{this.props.name.toUpperCase()}</h1> }

test('Should have unique id', () => {
  @remold class Foo {}
  const first = new Foo(), second = new Foo()

  expect(first.__REMOLD_ID__).not.toBe(second.__REMOLD_ID__)
  expect(first.__REMOLD_ID__).toBe(first.__REMOLD_ID__)
})

describe('Remold subclass', () => {
  @remold class User {
    name = 'Remold'
    age = 1

    @act changeNameTo(aName) { this.name = aName }

    @mold(UserCard) asCard(postfix) {
      return { name: this.name, postfix }
    }

    @mold(UserTitle) asTitle() {
      return { name: this.name }
    }
  }

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

  test('Mold with PureComponent should be rerendered only if needed', () => {
    let renderCalledTimes = 0
    class AgeComponent extends React.PureComponent {
      render = () => {
          renderCalledTimes += 1
          return <p>{this.props.age}</p>
      }
    }

    const asAge = mold(AgeComponent)(null, null, { value: () => ({ age: user.age }) })
    mount(asAge.value.apply(user))

    user.changeNameTo('New Name')

    expect(renderCalledTimes).toBe(1)
  })

  test('Mold should have key', () => {
    expect(user.asCard().key).toBe('UserCard-' + user.__REMOLD_ID__)
  })
})
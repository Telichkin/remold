import Id from './Id'

test('Should get id of object', () => {
  const obj = {}

  expect(Id.of(obj)).toBeDefined()
});

test('Different objects should have different ids', () => {
  const first = {}, second = {}

  expect(Id.of(first)).not.toBe(Id.of(second))
});

test('Same objects should have the same id', () => {
  const obj = {}

  expect(Id.of(obj)).toBe(Id.of(obj))
});
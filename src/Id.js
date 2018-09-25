export default {
  of(anObject) {
    if (!objects.has(anObject)) {
      objects.set(anObject, (id++).toString())
    }
    return objects.get(anObject)
  }
}

let id = 0, objects = new WeakMap()
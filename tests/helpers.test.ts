import { replaceReference} from '../src/helpers/replaceReference'
import { selectorToPath } from '../src/helpers/selectorToPath'

describe('replaceReference', () => {
  test('Replaces reference for objects', () => {
    const initial = {}
    const replaced = replaceReference(initial)
    expect(initial).not.toBe(replaced)
  })
  test('Replaces reference for arrays', () => {
    const initial = []
    const replaced = replaceReference(initial)
    expect(initial).not.toBe(replaced)
  })
  test('Replaces reference for Maps', () => {
    const initial = new Map()
    const replaced = replaceReference(initial)
    expect(initial).not.toBe(replaced)
  })
  test('Replaces reference for Sets', () => {
    const initial = new Map()
    const replaced = replaceReference(initial)
    expect(initial).not.toBe(replaced)
  })
  test('Replaces reference for Dates', () => {
    const initial = new Map()
    const replaced = replaceReference(initial)
    expect(initial).not.toBe(replaced)
  })
  test('Returns original if typeof initial != \'object\'', () => {
    const initial = function(){ return }
    const replaced = replaceReference(initial)
    expect(initial).toBe(replaced)
  })
})

describe('selectorToPath', () => {
  test('Works with arrays', () => {
    const path = selectorToPath((state) => state.a.b[0])
    expect(path).toStrictEqual(['a', 'b', '0'])
  })
  test('Works with objects', () => {
    const path = selectorToPath((state) => state.a.b)
    expect(path).toStrictEqual(['a', 'b'])

  })
  test('Works with combination of arrays and objects', () => {
    const path = selectorToPath((state) => state[0].a[0].b)
    expect(path).toStrictEqual(['0', 'a', '0', 'b'])
  })
})

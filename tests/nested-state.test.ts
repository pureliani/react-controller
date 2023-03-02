import { renderHook, act } from '@testing-library/react-hooks'
import { create } from '../src'

test('Sets the nested value', async () => {
  const { useSelector } = create({ a: { b: [{ c: [4] }] } })
  const { result, waitForNextUpdate } = renderHook(() => useSelector(state=>state.a.b[0].c[0]))
  const r = Math.random() * 100
  
  act(() => {
    result.current[1](r)
  })
  
  await waitForNextUpdate()

  expect(result.current[0]).toBe(r)
})

test('Sets the nested value and doesn\'t change the types along the way', async () => {
  const { useSelector, getState } = create({ a: { b: [{ c: [4] }] } })
  const { result, waitForNextUpdate } = renderHook(() => useSelector(state => state.a.b[0].c[0]))
  const r = Math.random() * 100
  act(() => {
    result.current[1](r)
  })

  await waitForNextUpdate()

  expect(result.current[0]).toBe(r)

  const currentState = getState()

  expect(typeof currentState).toBe('object')
  expect(!Array.isArray(currentState)).toBe(true)

  expect(typeof currentState.a).toBe('object')
  expect(!Array.isArray(currentState.a)).toBe(true)

  expect(typeof currentState.a.b).toBe('object')
  expect(Array.isArray(currentState.a.b)).toBe(true)

  expect(typeof currentState.a.b[0]).toBe('object')
  expect(!Array.isArray(currentState.a.b[0])).toBe(true)

  expect(typeof currentState.a.b[0].c).toBe('object')
  expect(Array.isArray(currentState.a.b[0].c)).toBe(true)

  expect(typeof currentState.a.b[0].c[0]).toBe('number')
})

//TODO: Do not change the test. fix the bug in the code to make this test pass
test('Sets the root state asynchronously', async () => {
  const { useSelector, setState } = create({ a: { b: 5 } })
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  const getNextState = () => Promise.resolve({ 
    a: { 
      b: 144
    }
  })

  act(() => {
    setState(async () => {
      return await getNextState()
    })
  })

  await waitForNextUpdate()

  expect(result.current[0].a.b).toBe(144)
})


//TODO: add tests for plugins

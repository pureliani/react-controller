import { renderHook, act } from '@testing-library/react-hooks'
import { create } from '../src/create'

test('Sets the nested value', async () => {
  const { useSelector } = create({ a: { b: [{ c: [4] }] } })
  const { result } = renderHook(() => useSelector(state=>state.a.b[0].c[0]))
  const r = Math.random() * 100
  act(() => {
    result.current[1](r)
  })
  expect(result.current[0]).toBe(r)
})

test('Sets the nested value and doesn\'t change the types along the way', async () => {
  const { useSelector, getState } = create({ a: { b: [{ c: [4] }] } })
  const { result } = renderHook(() => useSelector(state => state.a.b[0].c[0]))
  const r = Math.random() * 100
  act(() => {
    result.current[1](r)
  })
  expect(result.current[0]).toBe(r)

  const currentState = getState()
  expect(typeof currentState === 'object' && !Array.isArray(currentState))
  expect(typeof currentState.a === 'object' && !Array.isArray(currentState.a))
  expect(typeof currentState.a.b === 'object' && Array.isArray(currentState.a.b))
  expect(typeof currentState.a.b[0] === 'object' && !Array.isArray(currentState.a.b[0]))
  expect(typeof currentState.a.b[0].c === 'object' && Array.isArray(currentState.a.b[0].c))
  expect(typeof currentState.a.b[0].c[0] === 'number')
})

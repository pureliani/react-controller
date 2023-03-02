import { renderHook, act } from '@testing-library/react-hooks'
import { create } from '../src/create'

test('Sets the value', async () => {
  const { useSelector } = create(0)
  const { result } = renderHook(() => useSelector())
  act(() => {
    result.current[1](42)
  })
  expect(result.current[0]).toBe(42)
})

test('Sets the state based on previous value', async () => {
  const { useSelector } = create(5)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())
  act(() => {
    result.current[1](state => state + 13)
  })
  await waitForNextUpdate()
  expect(result.current[0]).toBe(18)
})

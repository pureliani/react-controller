import { renderHook, act } from '@testing-library/react-hooks'
import { create, persist } from '../src'

test('Sets the value', async () => {
  const { useSelector } = create(0)
  const { result } = renderHook(() => useSelector())
  act(() => {
    result.current[1](42)
  })
  expect(result.current[0]).toBe(42)
})

test('Sets the new state based on the previous', async () => {
  const { useSelector } = create(5)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())
  act(() => {
    result.current[1](state => state + 13)
  })
  await waitForNextUpdate()
  expect(result.current[0]).toBe(18)
})

test('Works with asynchronous actions', async () => {
  const { useSelector } = create(5)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  const getNextState = () => Promise.resolve(1000)

  act(() => {
    result.current[1](async () => {
      return await getNextState()
    })
  })

  await waitForNextUpdate()

  expect(result.current[0]).toBe(1000)
})

test('Subscribes to the store changes', async () => {
  const { useSelector, subscribe } = create(5)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  const mockSubscriber = jest.fn()

  subscribe(mockSubscriber)

  act(() => {
    result.current[1](state=> state + 10)
  })

  await waitForNextUpdate()

  expect(mockSubscriber).toBeCalledWith(15)
})

test('Persists a primitive store via \'persist\' plugin', async () => {
  const { useSelector } = create(0, [persist('counter')])
  const { result } = renderHook(() => useSelector())

  act(() => {
    result.current[1](42)
  })

  expect(Number(localStorage.counter)).toBe(42)
})


//TODO: add a test for brooadcast plugin

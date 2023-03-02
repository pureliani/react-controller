import { renderHook, act } from '@testing-library/react-hooks'
import { create, persist } from '../src'

test('Sets the value', async () => {
  const { useSelector } = create(0)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())
  
  act(() => {
    result.current[1](42)
  })

  await waitForNextUpdate()

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

test('Subscribes and unsubscribes to the store changes', async () => {
  const { useSelector, subscribe } = create(5)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  const mockSubscriber = jest.fn()

  const unsubscribe = subscribe(mockSubscriber)

  act(() => {
    result.current[1](state=> state + 10)
  })
  
  await waitForNextUpdate()
  expect(mockSubscriber).toBeCalledWith(15)
  
  unsubscribe()

  act(() => {
    result.current[1](state=> state + 10)
  })
  
  await waitForNextUpdate()

  expect(mockSubscriber).toBeCalledTimes(1)
})

test('Persists a primitive store via \'persist\' plugin', async () => {
  const { useSelector } = create(0, [persist('counter')])
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  act(() => {
    result.current[1](42)
  })

  await waitForNextUpdate()

  expect(JSON.parse(localStorage.counter)).toBe(42)
})

test('Callback initializes primitive state', async () => {
  const { useSelector, setState } = create(() => {
    return "hello"
  })
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  act(() => {
    setState(() => "world")
  })

  await waitForNextUpdate()

  expect(result.current[0]).toBe("world")
})

//TODO: add a test for brooadcast plugin

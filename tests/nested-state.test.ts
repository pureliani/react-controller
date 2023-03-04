import { renderHook, act } from '@testing-library/react-hooks'
import { broadcast, create, persist } from '../src'

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

test('Updates the nested value based on the previous state', async () => {
  const { useSelector, getState } = create({ a: { b: [{ c: [5] }] } })
  const { result, waitForNextUpdate } = renderHook(() => useSelector(state=>state.a.b[0].c[0]))
  
  act(() => {
    result.current[1](current => current + 5)
  })
  
  await waitForNextUpdate()

  expect(result.current[0]).toBe(10)
  expect(getState().a.b[0].c[0]).toBe(10)
})

test('Works with asynchronous actions', async () => {
  const { useSelector, getState } = create({ a: { b: [{ c: [5] }] } })
  const { result, waitForNextUpdate } = renderHook(() => useSelector(state=>state.a.b[0].c[0]))
  const r = Math.random()*100

  const getNextState = () => Promise.resolve(r)

  act(() => {
    result.current[1](async () => { return await getNextState() })
  })
  
  await waitForNextUpdate()

  expect(result.current[0]).toBe(r)
  expect(getState().a.b[0].c[0]).toBe(r)
})

test('Subscribes and unsubscribes to the store changes', async () => {
  const initialState = { a: { b: [{ c: [5] }] } }

  const { useSelector, subscribe } = create(initialState)
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  const mockSubscriber = jest.fn()

  const unsubscribe = subscribe(mockSubscriber)

  const nextState: typeof initialState = { a: { b: [{ c: [1_000_000] }] } }

  act(() => {
    result.current[1](nextState)
  })
  
  await waitForNextUpdate()
  expect(mockSubscriber).toBeCalledWith(nextState)
  
  unsubscribe()

  const nextState2: typeof initialState = { a: { b: [{ c: [5_000_000] }] } }

  act(() => {
    result.current[1](nextState2)
  })
  
  await waitForNextUpdate()

  expect(mockSubscriber).toBeCalledTimes(1)
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

test('Persists a nested state via \'persist\' plugin', async () => {
  const initialState = { a: { b: [{ c: [1_000_000] }] } }
  const { useSelector } = create(initialState, [persist('nested-state')])
  const { result, waitForNextUpdate } = renderHook(() => useSelector())
  const nextState: typeof initialState = { a: { b: [{ c: [1] }] } }

  act(() => {
    result.current[1](nextState)
  })

  await waitForNextUpdate()

  expect(JSON.parse(localStorage.getItem('nested-state')??'')).toStrictEqual(nextState)
})

test('Callback initializes nested state', async () => {
  const { useSelector, setState } = create(() => {
    return { a: { b: -4 } }
  })
  const { result, waitForNextUpdate } = renderHook(() => useSelector())

  act(() => {
    setState(() => ({a: { b: 17 }}))
  })

  await waitForNextUpdate()

  expect(result.current[0].a.b).toBe(17)
})

//TODO: fix the error 'BroadcastChannel is undefined'
test('Nested state emits changes on a broadcast channel', async () => {
  const initialState = { a: { b: [{ c: [1_000_000] }] } }
  const { useSelector } = create(initialState, [broadcast('nested-channel')])
  const { result, waitForNextUpdate } = renderHook(() => useSelector())
  const nextState: typeof initialState = { a: { b: [{ c: [1] }] } }
  
  const bc = new BroadcastChannel('nested-channel')
  const mockBcListener = jest.fn()
  bc.onmessage = mockBcListener
  
  act(() => {
    result.current[1](nextState)
  })
  
  await waitForNextUpdate()
  
  expect(mockBcListener).toBeCalledTimes(1)
})


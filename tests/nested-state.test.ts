import { renderHook, act } from '@testing-library/react-hooks'
import { create, persist } from '../src'

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

/*
  let's say we have a store from which one component is selecting 'state.a.b.c'
  and another component is selecting 'state.a', in case 'state.a.b' gets updated, 
  we want to also update (rerender) the component which was selecting 'state.a'
  since it's on the path to 'state.a.b', we also don't want to rerender anything
  which is on the different path (has a different selector).

  e.g: let's say we want to update 'state.a.b.c'
  to achieve the results we spoke about, we need to replace references to:
  state
  state.a
  state.a.b
  state.a.b.c

  replacing references for each level will ensure that rerender will be triggered only for
  the components which are using one of the above listed selectors.

  references to: state.z or state.a.y or state.a.b.t or some other objects will not be replaced, therefore
  components which are using these other selectors will not be rerendered.
*/
test('Replaces only the references which are on the path to the selected value', async () => {
  const initialState = { a: { b: { c: [{ d: 1 }] } }, e: { f: { g: [{ h: 2 }] } } }
  const { useSelector, getState } = create(initialState)
  const { result, waitForNextUpdate } = renderHook(() => useSelector(state => state.a.b.c[0].d))

  act(() => {
    result.current[1](5)
  })

  await waitForNextUpdate()

  // Changes the reference of each object / array on the path to target.
  // this should happen so that it causes a rerender if some component is selecting
  // lets say state.a and we are changing state.a.b
  expect(getState()).not.toBe(initialState)
  expect(getState().a).not.toBe(initialState.a)
  expect(getState().a.b).not.toBe(initialState.a.b)
  expect(getState().a.b.c).not.toBe(initialState.a.b.c)
  expect(getState().a.b.c[0]).not.toBe(initialState.a.b.c[0])
  expect(getState().a.b.c[0].d).not.toBe(initialState.a.b.c[0].d)

  // it should not replace other references in the store
  expect(getState().e).toBe(initialState.e)
  expect(getState().e.f).toBe(initialState.e.f)
  expect(getState().e.f.g).toBe(initialState.e.f.g)
  expect(getState().e.f.g[0]).toBe(initialState.e.f.g[0])
  expect(getState().e.f.g[0].h).toBe(initialState.e.f.g[0].h)

  expect(getState().a.b.c[0].d).toBe(5)
  expect(result.current[0]).toBe(5)
})

//TODO: fix the error 'BroadcastChannel is undefined'
// test('Nested state emits changes on a broadcast channel', async () => {
//   const initialState = { a: { b: [{ c: [1_000_000] }] } }
//   const { useSelector } = create(initialState, [broadcast('nested-channel')])
//   const { result, waitForNextUpdate } = renderHook(() => useSelector())
//   const nextState: typeof initialState = { a: { b: [{ c: [1] }] } }
  
//   const bc = new BroadcastChannel('nested-channel')
//   const mockBcListener = jest.fn()
//   bc.onmessage = mockBcListener
  
//   act(() => {
//     result.current[1](nextState)
//   })
  
//   await waitForNextUpdate()
  
//   expect(mockBcListener).toBeCalledTimes(1)
// })


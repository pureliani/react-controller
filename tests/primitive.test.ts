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

test('Sets the new state based on the previous previous', async () => {
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

  const getRandomRemoteNumber = (): Promise<number> => {
    return new Promise((res)=>{
      setTimeout(() => {
        res(1000)
      }, 100)
    })
  } 

  act(() => {
    result.current[1](async () => {
      const numberFromRemote = await getRandomRemoteNumber()
      return numberFromRemote
    })
  })

  await waitForNextUpdate()

  expect(result.current[0]).toBe(1000)
})

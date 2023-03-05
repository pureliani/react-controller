import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { selectorToPath } from '../helpers/selectorToPath'
import { setNestedValue } from '../helpers/setNestedValue'
import type { StateSetter, StoreAPI, UseSelector } from '../types'

export const createUseSelector = <State>(storeAPI: StoreAPI<State>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (function useSelector (key = state => state as any) {
    const getSnapshot = useCallback(() => {
      return key(storeAPI.getState())
    }, [key])
       
    const value = useSyncExternalStore(storeAPI.subscribeInternal, getSnapshot, getSnapshot)
    const path = useMemo(() => selectorToPath(key), [key])
  
    const setValue: StateSetter<ReturnType<typeof key>> = useCallback(async (update) => {
      const newValue = await (update instanceof Function ? Promise.resolve(update(value)) : Promise.resolve(update))
      const nextRootState = setNestedValue<State>({ state: storeAPI.getState(), path, value: newValue })
      await storeAPI.setState(nextRootState)
      storeAPI.notify(['internal', 'external', 'channel'])
      return newValue
    }, [path, value])
  
    return [value, setValue]
  }) satisfies UseSelector<State>
}

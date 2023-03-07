import { useCallback, useMemo } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import { selectorToPath } from '../helpers/selectorToPath'
import { setNestedValue } from '../helpers/setNestedValue'
import type { StateSetter, StoreAPI, UseSelector } from '../types'

export const createUseSelector = <State>(storeAPI: StoreAPI<State>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (function useSelector (selector = state => state as any) {
    const value = useSyncExternalStoreWithSelector(
      storeAPI.subscribeInternal, 
      storeAPI.getState, 
      storeAPI.getState, 
      selector)
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const path = useMemo(() => selectorToPath(selector), [])
  
    const setValue: StateSetter<ReturnType<typeof selector>> = useCallback(async (update) => {
      const newValue = await (update instanceof Function ? Promise.resolve(update(value)) : Promise.resolve(update))
      const nextRootState = setNestedValue<State>({ state: storeAPI.getState(), path, value: newValue })
      await storeAPI.setState(nextRootState)
      storeAPI.notify(['internal', 'external', 'channel'])
      return newValue
    }, [path, value])
  
    return [value, setValue]
  }) satisfies UseSelector<State>
}

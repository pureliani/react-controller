import { useCallback } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import type { StateSetter, StoreAPI, UseSelector } from '../types'

export const createUseSelector = <State>(storeAPI: StoreAPI<State>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (function useSelector(selector = state => state as any) {
    const value = useSyncExternalStoreWithSelector(
      storeAPI.subscribeInternal, 
      storeAPI.getState, 
      storeAPI.getState, 
      selector)

    const setValue: StateSetter<ReturnType<typeof selector>> = useCallback(async (update) => {
      const value = await storeAPI.stateSetter(selector)(update)
      storeAPI.notify(['internal', 'external', 'channel'])
      return value
    
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  
    return [value, setValue]
  }) satisfies UseSelector<State>
}

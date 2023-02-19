import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { createStoreAPI } from '../helpers/createStoreAPI'
import { selectorToPath } from '../helpers/selectorToPath'
import { setNestedValue } from '../helpers/setNestedValue'
import type { CreateStore, StateSetter, UseSelector } from '../types'

export const create: CreateStore = (initialState, plugins) => {
    type State = typeof initialState

    const storeAPI = createStoreAPI(initialState)

    plugins?.forEach(p => {
      p(storeAPI)
    })
    
    let isServerStateInitialized = false
    const initServerState = (newState: State) => {
      if (typeof window !== 'undefined' && !isServerStateInitialized) {
        storeAPI.setState(newState)
        isServerStateInitialized = true
      } else {
        storeAPI.setState(newState)
      } 
    }
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const useSelector: UseSelector<State> = (key = state => state as any) => {
      const getSnapshot = useCallback(() => {
        return key(storeAPI.getState())
      }, [key])

     
      const value = useSyncExternalStore(storeAPI.subscribeInternal, getSnapshot, getSnapshot)
      const path = useMemo(() => selectorToPath(key), [key])

      const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
        let nextValue: typeof value | null = null
        if (update instanceof Function) {
          nextValue = update(value)
        } else {
          nextValue = update
        }
        const nextRootState = setNestedValue<State>({ state: storeAPI.getState(), path, value: nextValue })
        storeAPI.setState(nextRootState)
        storeAPI.notify(['internal', 'external', 'channel'])
      }, [path, value])

      return [value, setValue]
    }

    const setStateWrapper: typeof storeAPI.setState = (update) => {
      storeAPI.setState(update)
      storeAPI.notify(['internal', 'external', 'channel'])
    }

    return {
      getState: storeAPI.getState,
      setState: setStateWrapper,
      subscribe: storeAPI.subscribeExternal,
      initServerState,
      useSelector
    }
}

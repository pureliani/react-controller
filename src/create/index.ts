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
    
    const setStateWrapper: typeof storeAPI.setState = (update) => {
      storeAPI.setState(update)
      storeAPI.notify(['internal', 'external', 'channel'])
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const useSelector: UseSelector<State> = (key = state => state as any) => {
      const getSnapshot = useCallback(() => {
        return key(storeAPI.getState())
      }, [key])

     
      const value = useSyncExternalStore(storeAPI.subscribeInternal, getSnapshot, getSnapshot)
      const path = useMemo(() => selectorToPath(key), [key])

      const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
        if (update instanceof Function) {
          Promise.resolve(update(value)).then(newValue => {
            const nextRootState = setNestedValue<State>({ state: storeAPI.getState(), path, value: newValue })
            setStateWrapper(nextRootState)
          })
        } else {
          const nextRootState = setNestedValue<State>({ state: storeAPI.getState(), path, value: update })
          setStateWrapper(nextRootState)
        }
      }, [path, value])

      return [value, setValue]
    }

    return {
      getState: storeAPI.getState,
      setState: setStateWrapper,
      subscribe: storeAPI.subscribeExternal,
      initServerState,
      useSelector
    }
}

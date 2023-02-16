import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { createStore } from '../helpers/createStoreAPI'
import { selectorToPath } from '../helpers/selectorToPath'
import { setNestedValue } from '../helpers/setNestedValue'
import type { CreateStore, StateSetter, UseSelector } from '../types'

export const create: CreateStore = (initialState, plugins) => {
    type State = typeof initialState

    const store = createStore(initialState)

    plugins?.forEach(p => {
      p(store)
    })
    
    let isServerStateInitialized = false
    const initServerState = (newState: State) => {
      if (!isServerStateInitialized) {
        store.setState(newState)
        isServerStateInitialized = true
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const useSelector: UseSelector<State> = (key = state => state as any) => {
      const getSnapshot = useCallback(() => {
        return key(store.getState())
      }, [key])

     
      const value = useSyncExternalStore(store.subscribeInternal, getSnapshot, getSnapshot)
      const path = useMemo(() => selectorToPath(key), [key])

      const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
        let nextValue: typeof value | null = null
        if (update instanceof Function) {
          nextValue = update(value)
        } else {
          nextValue = update
        }
        const nextRootState = setNestedValue<State>({ state: store.getState(), path, value: nextValue })
        store.setState(nextRootState)
        store.notify(['internal', 'external', 'channel'])
      }, [path, value])

      return [value, setValue]
    }

    const setStateWrapper: typeof store.setState = (update) => {
      store.setState(update)
      store.notify(['internal', 'external', 'channel'])
    }

    return {
      getState: store.getState,
      setState: setStateWrapper,
      subscribe: store.subscribeExternal,
      initServerState,
      useSelector
    }
}

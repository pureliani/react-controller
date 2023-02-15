import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { createStore } from '../helpers/createStoreAPI'
import { createServerStateProvider } from '../helpers/createServerStateProvider'
import { selectorToPath } from '../helpers/selectorToPath'
import { setNestedValue } from '../helpers/setNestedValue'
import type { CreateStore, StateSetter, UseSelector } from '../types'

export const create: CreateStore = (initialState, plugins) => {
    type State = typeof initialState

    const store = createStore(initialState)
    const { ServerStateProvider, useServerStateProvider } = createServerStateProvider<State>()

    plugins?.forEach(p => {
      p(store)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const useSelector: UseSelector<State> = (key = state => state as any) => {
      const serverState = useServerStateProvider()
      const getSnapshot = useCallback(() => {
        if (serverState !== null) {
          return key(serverState)
        } else {
          return key(store.getState())
        }
      }, [])

      const value = useSyncExternalStore(store.subscribeInternal, getSnapshot, getSnapshot)
      const path = useMemo(() => selectorToPath(key), [])


      const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
        const oldValue = key(store.getState())
        let nextValue: typeof oldValue | null = null
        if (update instanceof Function) {
          nextValue = update(oldValue)
        } else {
          nextValue = update
        }
        const nextRootState = setNestedValue({ state: store.getState(), path, value: nextValue })
        store.setState(nextRootState)
        store.notify(['internal', 'external', 'channel'])
      }, [])

      return [value, setValue]
    }

    const setStateWrapper: typeof store.setState = (update) => {
      store.setState(update)
      store.notify(['internal', 'external', 'channel'])
    }

    let isServerStateInitialized = false
    const initServerState = (newState: State) => {
      if (!isServerStateInitialized) {
        store.setState(newState)
        isServerStateInitialized = true
      }
    }

    return {
      getState: store.getState,
      setState: setStateWrapper,
      subscribe: store.subscribeExternal,
      ServerStateProvider,
      initServerState,
      useSelector
    }
}

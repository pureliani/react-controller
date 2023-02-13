import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { createStore } from '../helpers/createStore'
import { selectorToPath } from "../helpers/selectorToPath"
import { setNestedValue } from "../helpers/setNestedValue"
import { persist } from '../plugins/persist'

export type TObject = { [key: string | number | symbol]: any }

export type Listener = () => void

export type StateSetter<State> = (update: State | ((state: State) => State)) => void

type Plugins = (ReturnType<typeof persist>)[]

type UseHook<State> = <TSelected>(key: (state: State) => TSelected) => { value: TSelected, setValue: StateSetter<TSelected> }

export const create = <State extends TObject>(initialState: State, plugins?: Plugins) => {
    const store = createStore(initialState)

    plugins?.forEach(p => {
        p(store)
    })

    const useSelector: UseHook<State> = (key) => {
        const value = useSyncExternalStore(store.subscribeInternal, () => key(store.getRootState()))
        const path = useMemo(() => selectorToPath(key), [])

        const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
            const oldValue = key(store.getRootState())
            let nextValue: typeof oldValue | null = null
            if (update instanceof Function) {
                nextValue = update(oldValue)
            } else {
                nextValue = update
            }
            const nextRootState = setNestedValue({ state: store.getRootState(), path, value: nextValue })
            store.setRootState(nextRootState)
            store.notifyExternalListeners()
            store.notifyInternalListeners()
        }, [])

        return { value, setValue }
    }

    return {
        getState: store.getRootState,
        setState: store.setRootState,
        subscribe: store.subscribeExternal,
        useSelector
    }
}

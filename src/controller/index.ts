import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { createStore } from '../helpers/createStore'
import { selectorToPath } from "../helpers/selectorToPath"
import { setNestedValue } from "../helpers/setNestedValue"

export type TObject = { [key: string | number | symbol]: any }

export type Listener = () => void

export type StateSetter<State> = (update: State | ((state: State) => State)) => void

type UseHook<State> = <TSelected>(key: (state: State) => TSelected) => { value: TSelected, setValue: StateSetter<TSelected> }

export const create = <State extends TObject>(initialState: State) => {
    const {
        getRootState,
        setRootState,
        subscribeExternal,
        subscribeInternal,
    } = createStore(initialState)

    const useSelector: UseHook<State> = (key) => {
        const value = useSyncExternalStore(subscribeInternal, () => key(getRootState()))
        const path = useMemo(() => selectorToPath(key), [])

        const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
            const oldValue = key(getRootState())
            let nextValue: typeof oldValue | null = null
            if (update instanceof Function) {
                nextValue = update(oldValue)
            } else {
                nextValue = update
            }
            const nextRootState = setNestedValue({ state: getRootState(), path, value: nextValue })
            setRootState(nextRootState)
        }, [])

        return { value, setValue }
    }

    return {
        getState: getRootState,
        setState: setRootState,
        subscribe: subscribeExternal,
        useSelector
    }
}

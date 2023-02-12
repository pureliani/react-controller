import { useCallback, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { cloneFunction } from '../helpers/cloneFunction'
import { selectorToPath } from "../helpers/selectorToPath"
import { setNestedValue } from "../helpers/setNestedValue"

export type TObject = { [key: string | number | symbol]: any }

export type Listener = () => void

type StateSetter<State> = (update: State | ((state: State) => State)) => void

type UseHook<State> = <TSelected>(key: (state: State) => TSelected) => { value: TSelected, setValue: StateSetter<TSelected> }

export const create = <State extends TObject>(initialState: State) => {
    let state = initialState
    const listeners = new Set<Listener>()
    const subscribe = (listener: Listener) => {
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }
    const notifyListeners = () => listeners.forEach(listener => listener())

    const useHook: UseHook<State> = (key) => {
        const value = useSyncExternalStore(subscribe, () => key(state))
        const path = useMemo(() => selectorToPath(key), [])

        const setValue: StateSetter<ReturnType<typeof key>> = useCallback((update) => {
            const oldValue = key(state)
            let nextValue: typeof oldValue | null = null
            if (update instanceof Function) {
                nextValue = update(oldValue)
            } else {
                nextValue = update
            }
            const nextState = setNestedValue({ state, path, value: nextValue })
            state = nextState
            console.log('state was 1123')
            notifyListeners()
        }, [])

        return { value, setValue }
    }

    return useHook
}

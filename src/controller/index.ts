import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { getPathFromKey } from "../helpers/getPathFromKey"
import { setNestedValue } from "../helpers/setNestedValue"

export type TObject = { [key: string | number | symbol]: any }

export type Listener = () => void

type StateSetter<State> = (update: State | ((state: State) => State)) => void

type UseHook<State> = <TSelected>(key: (state: State) => TSelected) => { value: TSelected, setValue: StateSetter<TSelected> }

export const create = <State extends TObject>(initialState: State) => {
    let target: { ref: State } = { ref: initialState }
    const listeners = new Set<Listener>()
    const subscribe = (listener: Listener) => {
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }
    const notifyListeners = () => listeners.forEach(listener => listener())

    const useHook: UseHook<State> = (key) => {
        const value = useSyncExternalStore(subscribe, () => key(target.ref))

        const setValue: StateSetter<ReturnType<typeof key>> = (update) => {
            const path = getPathFromKey({ target, key })
            const nextValue = update instanceof Function ? update(key(target.ref)) : update
            const nextState = setNestedValue({ target, path, value: nextValue })
            target = nextState
            notifyListeners()
        }

        return { value, setValue }
    }

    return useHook
}

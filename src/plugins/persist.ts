import { TObject } from "../controller";
import { createStore } from "../helpers/createStore";

export const persist = (name: string) => <State extends TObject>(store: ReturnType<typeof createStore<State>>) => {
    if (typeof window === 'undefined') return store
    store.subscribeExternal((state) => {
        localStorage.setItem(name, JSON.stringify(state))
    })
    window.addEventListener('load', () => {
        const oldState = localStorage.getItem(name)
        if (!oldState) return
        store.setRootState(JSON.parse(oldState))
    })
    return store
}

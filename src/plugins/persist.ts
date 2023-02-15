import type { Plugin } from "../types";

export const persist: Plugin = (name: string) => (store) => {
    if (typeof window === 'undefined') return
    store.subscribeExternal((state) => {
        localStorage.setItem(name, JSON.stringify(state))
    })
    window.addEventListener('load', () => {
        const oldState = localStorage.getItem(name)
        if (!oldState) return
        store.setState(JSON.parse(oldState))
        store.notify(['internal', 'external', 'channel'])
    })
}

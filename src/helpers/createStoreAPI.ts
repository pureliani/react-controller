import type { InternalListener, Listener, ListenerType, StateSetter, StoreAPI } from "../types";

export const createStore = <State>(store: State): StoreAPI<State> => {
    let state = store
    const getState = () => state
    const internalListeners = new Set<InternalListener>()
    const externalListeners = new Set<Listener<State>>()
    const channelListeners = new Set<Listener<State>>()
    const subscribeInternal = (listener: InternalListener) => {
        internalListeners.add(listener)
        return () => {
            internalListeners.delete(listener)
        }
    }

    const subscribeExternal = (listener: Listener<State>) => {
        externalListeners.add(listener)
        return () => {
            externalListeners.delete(listener)
        }
    }

    const subscribeChannel = (listener: Listener<State>) => {
        channelListeners.add(listener)
        return () => {
            channelListeners.delete(listener)
        }
    }

    const notify = (listeners: ListenerType[]) => {
        if (listeners.includes('internal')) {
            internalListeners.forEach(listener => listener())
        }
        if (listeners.includes('external')) {
            externalListeners.forEach(listener => listener(getState()))
        }
        if (listeners.includes('channel')) {
            channelListeners.forEach(listener => listener(getState()))
        }
    }

    const setState: StateSetter<State> = (update) => {
        if (update instanceof Function) {
            state = update(state)
        } else {
            state = update
        }
    }

    return {
        setState,
        getState,
        notify,
        subscribeInternal,
        subscribeExternal,
        subscribeChannel
    }
}
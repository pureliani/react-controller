import { Listener, StateSetter, TObject } from "../controller";

type StateListener<State> = (state: State) => void
type ListenerType = ('internal' | 'external' | 'channel')

export const createStore = <State extends TObject>(store: State) => {
    let state = store
    const getState = () => state
    const internalListeners = new Set<Listener>()
    const externalListeners = new Set<StateListener<State>>()
    const channelListeners = new Set<StateListener<State>>()
    const subscribeInternal = (listener: Listener) => {
        internalListeners.add(listener)
        return () => {
            internalListeners.delete(listener)
        }
    }

    const subscribeExternal = (listener: StateListener<State>) => {
        externalListeners.add(listener)
        return () => {
            externalListeners.delete(listener)
        }
    }

    const subscribeChannel = (listener: StateListener<State>) => {
        channelListeners.add(listener)
        return () => {
            channelListeners.delete(listener)
        }
    }

    const notifyListeners = (listeners: ListenerType[]) => {
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
        notifyListeners,
        subscribeInternal,
        subscribeExternal,
        subscribeChannel
    }
}
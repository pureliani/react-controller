import { Listener, StateSetter, TObject } from "../controller";

type StateListener<State> = (state: State) => void

export const createStore = <State extends TObject>(store: State) => {
    let state = store
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
    const getRootState = () => state

    const notifyInternalListeners = () => internalListeners.forEach(listener => listener())
    const notifyExternalListeners = () => externalListeners.forEach(listener => listener(state))
    const notifyChannelListeners = () => channelListeners.forEach(listener => listener(state))

    const setRootState: StateSetter<State> = (update) => {
        if (update instanceof Function) {
            state = update(state)
        } else {
            state = update
        }
        notifyInternalListeners()
        notifyExternalListeners()
        notifyChannelListeners()
    }
    const setRootStateWithoutChannels: StateSetter<State> = (update) => {
        if (update instanceof Function) {
            state = update(state)
        } else {
            state = update
        }
        notifyInternalListeners()
        notifyExternalListeners()
    }

    return {
        setRootState,
        setRootStateWithoutChannels,
        getRootState,
        subscribeInternal,
        subscribeExternal,
        subscribeChannel
    }
}
import { Listener, StateSetter, TObject } from "../controller";

type ExternalListener<State> = (state: State) => void

export const createStore = <State extends TObject>(store: State) => {
    let state = store
    const internalListeners = new Set<Listener>()
    const externalListeners = new Set<ExternalListener<State>>()
    const subscribeInternal = (listener: Listener) => {
        internalListeners.add(listener)
        return () => {
            internalListeners.delete(listener)
        }
    }
    const subscribeExternal = (listener: ExternalListener<State>) => {
        externalListeners.add(listener)
        return () => {
            externalListeners.delete(listener)
        }
    }
    const getRootState = () => state
    const notifyInternalListeners = () => internalListeners.forEach(listener => listener())
    const notifyExternalListeners = () => externalListeners.forEach(listener => listener(state))
    const setRootState: StateSetter<State> = (update) => {
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
        getRootState,
        subscribeInternal,
        subscribeExternal,
    }
}
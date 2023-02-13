import { TObject } from "../controller";
import { createStore } from "../helpers/createStore";

export const broadcast = (name: string) => <State extends TObject>(store: ReturnType<typeof createStore<State>>) => {
    if (typeof window === 'undefined') return store
    const channel = new BroadcastChannel(name)
    store.subscribeExternal((state) => {
        channel.postMessage(state)
    })
    channel.onmessage = (e: MessageEvent<ReturnType<typeof store.getRootState>>) => {
        store.setRootState(e.data)
        store.notifyInternalListeners()
    }
    return store
}

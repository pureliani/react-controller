import { TObject } from "../controller";
import { createStore } from "../helpers/createStore";

export const broadcast = (name: string) => <State extends TObject>(store: ReturnType<typeof createStore<State>>) => {
    if (typeof window === 'undefined') return store
    const channel = new BroadcastChannel(name)
    store.subscribeChannel((state) => {
        channel.postMessage(state)
    })
    channel.onmessage = (e: MessageEvent<ReturnType<typeof store.getRootState>>) => {
        store.setRootStateWithoutChannels(e.data)
    }
    return store
}

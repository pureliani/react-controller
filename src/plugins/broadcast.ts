import type { Plugin } from '../types'

export const broadcast: Plugin = (name: string) => (store) => {
  if (typeof window === 'undefined') return
  const channel = new BroadcastChannel(name)
  store.subscribeChannel((state) => {
    channel.postMessage(state)
  })
  channel.onmessage = async (e: MessageEvent<ReturnType<typeof store.getState>>) => {
    await store.setState(e.data)
    store.notify(['internal', 'external'])
  }
}

import type { Plugin } from '../types'

type M<S> = {
  type: 'GET'
} | {
  type: 'SET'
  state: S
}

export const broadcast: Plugin = (name: string) => (store) => {
  if (typeof window === 'undefined') return
  type S = ReturnType<typeof store.getState>
  const channel = new BroadcastChannel(name)

  store.subscribeChannel((state) => {
    channel.postMessage({state, type: 'SET'} as M<S>)
  })

  channel.onmessage = async (e: MessageEvent<M<S>>) => {
    if(e.data.type === 'GET') {
      console.log('Received GET request')
      channel.postMessage({ state: store.getState(), type: 'SET' } as M<S>)
    }
    if(e.data.type === 'SET') {
      console.log('Received SET request')
      await store.setState(e.data.state)
      store.notify(['internal', 'external'])
    }
  }

  window.addEventListener('load', () => {
    channel.postMessage({state: undefined, type: 'GET'} as M<S>)
  })
}

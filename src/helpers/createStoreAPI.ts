import type { CreateStoreAPI, InternalListener, Listener, ListenerType, NestedStateSetter, Subscribe, SubscribeInternal } from '../types'
import { selectorToPath } from './selectorToPath'
import { setNestedValue } from './setNestedValue'


export const createStoreAPI: CreateStoreAPI = (stateInitializer) => {
  let state = stateInitializer instanceof Function ? stateInitializer() : stateInitializer
  type State = typeof state
  
  const getState = () => state
  const internalListeners = new Set<InternalListener>()
  const externalListeners = new Set<Listener<State>>()
  const channelListeners = new Set<Listener<State>>()

  const subscribeInternal: SubscribeInternal = (listener: InternalListener) => {
    internalListeners.add(listener)
    return () => {
      internalListeners.delete(listener)
    }
  }

  const subscribeExternal: Subscribe<State> = (listener: Listener<State>) => {
    externalListeners.add(listener)
    return () => {
      externalListeners.delete(listener)
    }
  }

  const subscribeChannel: Subscribe<State> = (listener: Listener<State>) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stateSetter: NestedStateSetter<State> = (selector = state => state as any) => async (update) => {
    const path = selectorToPath(selector)
    const oldValue = selector(getState())
    const value = await (update instanceof Function ? Promise.resolve(update(oldValue)) : Promise.resolve(update))
    const nextRootState = setNestedValue({ state, path, value })
    state = nextRootState
    return value
  } 

  return {
    stateSetter,
    getState,
    notify,
    subscribeInternal,
    subscribeExternal,
    subscribeChannel
  }
}

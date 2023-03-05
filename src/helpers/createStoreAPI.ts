import type { CreateStoreAPI, InternalListener, Listener, ListenerType, StateSetter, Subscribe, SubscribeInternal } from '../types'

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

  const setState: StateSetter<State> = async (update) => {
    const newValue = await (update instanceof Function ? Promise.resolve(update(state)) : Promise.resolve(update))
    state = newValue
    return newValue
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

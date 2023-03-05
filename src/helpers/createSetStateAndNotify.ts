import type { StoreAPI } from '../types'

export const createSetStateAndNotify = <State>(storeAPI: StoreAPI<State>) => {
  return (async (update) => {
    const updatedState = await storeAPI.setState(update)
    storeAPI.notify(['internal', 'external', 'channel'])
    return updatedState
  }) satisfies typeof storeAPI.setState
} 

import type { StoreAPI } from '../types'

export const createServerStateInitializer = <State>(storeAPI: StoreAPI<State>) => {
  let isServerStateInitialized = false
  return (newState: State) => {
    if (typeof window !== 'undefined' && !isServerStateInitialized) {
      storeAPI.setState(newState)
      isServerStateInitialized = true
    } else {
      storeAPI.setState(newState)
    } 
  }
}

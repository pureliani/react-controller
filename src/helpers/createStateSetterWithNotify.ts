import type { NestedStateSetter, StoreAPI } from '../types'

export const createStateSetterWithNotify = <State>(storeAPI: StoreAPI<State>) => {
  const setStateWrapper: NestedStateSetter<State> = ((selector) => async (update) => {
    const updatedState = await storeAPI.stateSetter(selector)(update)
    storeAPI.notify(['internal', 'external', 'channel'])
    return updatedState
  })
  return setStateWrapper
} 

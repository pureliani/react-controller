import { createServerStateInitializer } from '../helpers/createServerStateInitializer'
import { createSetStateAndNotify } from '../helpers/createSetStateAndNotify'
import { createStoreAPI } from '../helpers/createStoreAPI'
import { createUseSelector } from '../helpers/createUseSelector'
import type { CreateStore } from '../types'

export const create: CreateStore = (stateInitializer, plugins) => {
  const storeAPI = createStoreAPI(stateInitializer)
  
  plugins?.forEach(p => {
    p(storeAPI)
  })

  const initServerState = createServerStateInitializer(storeAPI)
  const setStateAndNotify = createSetStateAndNotify(storeAPI)
  const useSelector = createUseSelector(storeAPI)

  return {
    getState: storeAPI.getState,
    setState: setStateAndNotify,
    subscribe: storeAPI.subscribeExternal,
    initServerState,
    useSelector
  }
}

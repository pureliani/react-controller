import { createServerStateInitializer } from '../helpers/createServerStateInitializer'
import { createStateSetterWithNotify } from '../helpers/createStateSetterWithNotify'
import { createStoreAPI } from '../helpers/createStoreAPI'
import { createUseSelector } from '../helpers/createUseSelector'
import type { CreateStore } from '../types'

export const create: CreateStore = (stateInitializer, plugins) => {
  const storeAPI = createStoreAPI(stateInitializer)
  
  plugins?.forEach(p => {
    p(storeAPI)
  })

  const initServerState = createServerStateInitializer(storeAPI)
  const stateSetterWithNotify = createStateSetterWithNotify(storeAPI)
  const useSelector = createUseSelector(storeAPI)

  return {
    getState: storeAPI.getState,
    stateSetter: stateSetterWithNotify,
    subscribe: storeAPI.subscribeExternal,
    initServerState,
    useSelector
  }
}

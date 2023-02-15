import type { ReactNode } from 'react'

export type TObject = { [key: string | symbol | number]: unknown }

export type Path = (string | symbol | number)[]

export type InternalListener = () => void

export type ListenerType = 'internal' | 'external' | 'channel'

export type SubscribeInternal = (listener: InternalListener) => () => void

export type Listener<State> = (state: State) => void

export type Subscribe<State> = (listener: Listener<State>) => void

export type StateSetter<State> = (update: State | ((state: State) => State)) => void

export type StateGetter<State> = () => State

export type Notifier = (types: ListenerType[]) => void

export type StoreAPI<State> = {
  getState: StateGetter<State>
  setState: StateSetter<State>
  notify: Notifier
  subscribeInternal: SubscribeInternal
  subscribeExternal: Subscribe<State>
  subscribeChannel: Subscribe<State>
}

export type Plugin = (name: string) => <State>(storeAPI: StoreAPI<State>) => void

export type ServerStateProviderArg<State> = {
  children: ReactNode
  state: State
}

export type ServerStateProviderComponent<State> = (arg: ServerStateProviderArg<State>) => JSX.Element

export type initServerStateFunction<State> = (state: State) => void

export type UseSelector<State> = <TSelected = State>(key?: (state: State) => TSelected) => [TSelected, StateSetter<TSelected>]

export type CreatedStore<State> = {
  getState: StoreAPI<State>['getState']
  setState: StoreAPI<State>['setState']
  subscribe: StoreAPI<State>['subscribeExternal']
  ServerStateProvider: ServerStateProviderComponent<State>
  initServerState: initServerStateFunction<State>
  useSelector: UseSelector<State>
}

export type CreateStore = <State>(initialState: State, plugins?: ReturnType<Plugin>[]) => CreatedStore<State>

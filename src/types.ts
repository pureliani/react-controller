export type Path = (string | symbol | number)[]

export type InternalListener = () => void

export type ListenerType = 'internal' | 'external' | 'channel'

export type SubscribeInternal = (listener: InternalListener) => () => void

export type Listener<State> = (state: State) => void

export type Subscribe<State> = (listener: Listener<State>) => () => void

export type StateSetter<State> = (update: State | ((state: State) => State) | ((state: State) => Promise<State>)) => Promise<State>

export type NestedStateSetter<State> = 
<Selected = State>(selector?: (store: State) => Selected) 
=> (update: 
  | ((current: Selected) => Promise<Selected>) 
  | ((current: Selected) => Selected) 
  | Selected) 
=> Promise<Selected>

export type StateGetter<State> = () => State

export type Notifier = (types: ListenerType[]) => void

export type StoreAPI<State> = {
  getState: StateGetter<State>
  stateSetter: NestedStateSetter<State>
  notify: Notifier
  subscribeInternal: SubscribeInternal
  subscribeExternal: Subscribe<State>
  subscribeChannel: Subscribe<State>
}

export type Plugin = (name: string) => <State>(storeAPI: StoreAPI<State>) => void

export type initServerStateFunction<State> = (state: State) => void

export type UseSelector<State> = <TSelected = State>(key?: (state: State) => TSelected) => [TSelected, StateSetter<TSelected>]

export type Store<State> = {
  subscribe: Subscribe<State>
  initServerState: initServerStateFunction<State>
  useSelector: UseSelector<State>
} & Pick<StoreAPI<State>, 'getState' | 'stateSetter'>

export type StateInitializer<State> = State | (() => State)

export type CreateStore = <State>(initialState: StateInitializer<State>, plugins?: ReturnType<Plugin>[]) => Store<State>

export type CreateStoreAPI = <State>(initialState: StateInitializer<State>, plugins?: ReturnType<Plugin>[]) => StoreAPI<State>

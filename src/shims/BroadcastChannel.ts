type Listener = (message: { data: unknown }) => void
type ChannelName = string

class BroadcastChannelShim {
  static listeners: Map<ChannelName, Set<Listener>> = new Map()
  constructor(private name: string){}
  
  postMessage(message: unknown) {
    const listeners = BroadcastChannelShim.listeners.get(this.name)
    if(typeof listeners === 'undefined') return
    listeners.forEach(listener => listener({ data: message }))
  }
  
  addEventListener(listener: Listener) {
    const listeners = BroadcastChannelShim.listeners.get(this.name)
    if(typeof listeners === 'undefined') BroadcastChannelShim.listeners.set(this.name, new Set([listener]))
    else listeners?.add(listener)
  }
  
  removeEventListener(listener: Listener) {
    const setOfListeners = BroadcastChannelShim.listeners.get(this.name)
    setOfListeners?.delete(listener)
  }
  
  set onmessage(listener: Listener) {
    this.addEventListener(listener)
  }

  close(){
    BroadcastChannelShim.listeners.clear()
  }
}

global.BroadcastChannel = BroadcastChannelShim as never
  

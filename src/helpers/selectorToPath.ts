import type { Path, TObject } from '../types'

type Tracker<State> = (store: State) => unknown

export const selectorToPath = <State extends TObject>(tracker: Tracker<State>): Path => {
  const path: Path = []
  const handler: ProxyHandler<State> = {
    get(t, p) {
      path.push(p)
      return new Proxy({} as State, handler)
    }
  }
  const trackerProxy = new Proxy({} as State, handler)
  tracker(trackerProxy)
  return path
}

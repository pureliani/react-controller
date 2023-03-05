import type { Path } from '../types'

type Tracker<State> = (store: State) => unknown

export const selectorToPath = (tracker: Tracker<Record<string | number | symbol, never>>): Path => {
  const path: Path = []
  const handler: ProxyHandler<Record<string | number | symbol, never>> = {
    get(_, p) {
      path.push(p)
      return new Proxy({}, handler)
    }
  }
  const trackerProxy = new Proxy({}, handler)
  tracker(trackerProxy)
  return path
}

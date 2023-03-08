import type { Path } from '../types'

type Selector<State> = (store: State) => unknown

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DummyObject = Record<string | number | symbol, any>

export const selectorToPath = (selector: Selector<DummyObject>): Path => {
  const path: Path = []
  const handler: ProxyHandler<DummyObject> = {
    get(_, p) {
      path.push(p)
      return new Proxy({}, handler)
    }
  }
  const selectorTracker = new Proxy({}, handler)
  selector(selectorTracker)
  return path
}

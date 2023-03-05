import type { Path } from '../types'

type Selector<State> = (store: State) => unknown

type DummyObject = Record<string | number | symbol, never>

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

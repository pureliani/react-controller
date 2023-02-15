import type { Path, TObject } from "../types"

export const selectorToPath = (tracker: Function): Path => {
    const path: Path = []
    const handler: ProxyHandler<TObject> = {
        get(t, p) {
            path.push(p)
            return new Proxy({}, handler)
        }
    }
    const trackerProxy = new Proxy({}, handler)
    tracker(trackerProxy)
    return path
}
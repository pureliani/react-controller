type TObject = { [key: string | symbol | number]: any };

type Path = (string | symbol | number)[];

export type Key<TTarget> = (target: TTarget) => void;

type GetPathFromKeyArgs<TTarget extends { ref: TObject }> = {
    target: TTarget;
    key: Key<TTarget['ref']>;
};

type GetPathFromKey = <TTarget extends { ref: TObject }>(
    arg: GetPathFromKeyArgs<TTarget>
) => Path;

export const getPathFromKey: GetPathFromKey = ({ target, key }) => {
    const clone = JSON.parse(JSON.stringify(target));
    const path: Path = [];
    const isProxy = Symbol('isProxy');
    const handler: ProxyHandler<typeof clone> = {
        get(t, p) {
            if (p === isProxy) return true;
            path.push(p);
            if (typeof t[p] === 'object' && !t[p][isProxy]) {
                return new Proxy(t[p], handler);
            }
            return Reflect.get(t, p);
        },
    };
    const proxiedClone = new Proxy(clone, handler);
    key(proxiedClone.ref);
    return path;
};

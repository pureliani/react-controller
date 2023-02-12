export function cloneFunction<T extends Function>(fn: T): T {
    const that = fn;
    const temp = function temporary() {
        return that.apply(this, arguments);
    } as unknown as T;

    for (const key in fn) {
        if (fn.hasOwnProperty(key)) {
            (temp as any)[key] = (fn as any)[key];
        }
    }
    return temp;
}

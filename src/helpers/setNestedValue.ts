type SetNestedValueArgs<TTarget> = {
    state: TTarget
    path: (string | symbol | number)[]
    value: any
}

type SetNestedValue = <TTarget>(args: SetNestedValueArgs<TTarget>) => TTarget

export const setNestedValue: SetNestedValue = ({ state, path, value }) => {
    var schema = structuredClone(state);
    var len = path.length;
    if (len === 0) return structuredClone(value)
    for (var i = 0; i < len - 1; i++) {
        var elem = path[i];
        if (!schema[elem]) throw new Error('@gapu/deepstate: setNestedValue - Invalid Path')
        schema = schema[elem];
    }

    schema[path[len - 1]] = value;
    return schema
}
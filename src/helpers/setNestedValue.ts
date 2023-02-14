type TObject = { [key: string | symbol | number]: any };

type SetNestedValueArgs<TTarget extends TObject> = {
    state: TTarget
    path: (string | symbol | number)[]
    value: any
}

type SetNestedValue = <TTarget extends TObject>(args: SetNestedValueArgs<TTarget>) => TTarget

/**
 * @param target An object which contains the nested field 
 * @param path An array of type 'string' - representing the path to the field. 
 * @param value The new value of this field.
 * @returns Deep clone of the target object via 'JSON.parse(JSON.stringify())'
 */
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
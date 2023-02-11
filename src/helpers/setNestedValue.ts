type TObject = { [key: string | symbol | number]: any };

type SetNestedValueArgs<TTarget extends TObject> = {
    target: TTarget
    path: (string | symbol | number)[]
    value: any
}

type SetNestedValue = <TTarget extends TObject>(args: SetNestedValueArgs<TTarget>) => TTarget

/**
 * @param target An object which contains the nested field 
 * @param path An array of type 'string' - representing the path to the field. 
 * @param value The new value of this field.
 * @returns Deep clone of the target object via 'structuredClone'
 */
export const setNestedValue: SetNestedValue = ({ target, path, value }) => {
    const [head, ...rest] = path
    return {
        ...target,
        [head]: rest.length
            ? setNestedValue({ target: target[head], path: rest, value })
            : value
    }
}

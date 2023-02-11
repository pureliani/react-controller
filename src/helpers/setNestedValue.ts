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
 * @returns Deep clone of the target object via 'JSON.parse(JSON.stringify())'
 */
export const setNestedValue: SetNestedValue = ({ target, path, value }) => {
    var clone = JSON.parse(JSON.stringify(target));
    let movingReference: TObject = clone
    let movingKey: string | symbol | number = path[0]
    if (movingKey !== 0 && !movingKey) throw new Error('setNestedValue: path cannot be empty')
    path.forEach(p => {
        if (typeof movingReference[p] === 'object') {
            movingReference = movingReference[p]
            movingKey = p
        } else {
            movingKey = p
        }
    })
    movingReference[movingKey] = value
    return clone
}
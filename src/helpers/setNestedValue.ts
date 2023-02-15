type SetNestedValueArgs<TTarget> = {
  state: TTarget
  path: (string | symbol | number)[]
  value: unknown
}

type SetNestedValue = <TTarget>(args: SetNestedValueArgs<TTarget>) => TTarget

export const setNestedValue: SetNestedValue = ({ state, path, value }) => {
  let schema = structuredClone(state)
  const len = path.length
  if (len === 0) return structuredClone(value)
  for (let i = 0; i < len - 1; i++) {
    const elem = path[i]
    if (!schema[elem]) throw new Error('@gapu/deepstate: setNestedValue - Invalid Path')
    schema = schema[elem]
  }

  schema[path[len - 1]] = value
  return schema
}

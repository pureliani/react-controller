/* eslint-disable @typescript-eslint/no-explicit-any */
type SetNestedValueArgs = {
  state: any
  path: (string | symbol | number)[]
  value: any
}

type SetNestedValue = <State>(args: SetNestedValueArgs) => State

export const setNestedValue: SetNestedValue = ({ state, path, value }) => {
  const clone = structuredClone(state)
  if(path.length === 0) return structuredClone(value)
  let current = clone
  path.slice(0,-1).forEach(p=>{
    current = current[p]
  })
  current[path[path.length - 1]] = value
  return clone
}

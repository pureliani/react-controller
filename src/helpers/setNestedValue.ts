/* eslint-disable @typescript-eslint/no-explicit-any */
type SetNestedValueArgs<State> = {
  state: State
  path: (string | symbol | number)[]
  value: any
}

type SetNestedValue = <State>(args: SetNestedValueArgs<State>) => State

export const setNestedValue: SetNestedValue = ({ state, path, value }) => {
  const clone = Object.assign({}, state)
  if(path.length === 0) return value
  let current = clone
  path.slice(0,-1).forEach(p=>{
    current = (<any>current)[p]
  });
  (<any>current)[path[path.length - 1]] = value
  return clone
}

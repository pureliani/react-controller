import { replaceReference } from './replaceReference'
/* eslint-disable @typescript-eslint/no-explicit-any */

type SetNestedValueArgs<State> = {
  state: State
  path: (string | symbol | number)[]
  value: any
}

type SetNestedValue = <State>(args: SetNestedValueArgs<State>) => State

export const setNestedValue: SetNestedValue = ({ state, path, value }) => {
  if(path.length === 0) return value
  
  const clone = replaceReference(state)
  let current = clone

  path.slice(0,-1).forEach(p=>{
    (<any>current)[p] = replaceReference((<any>current)[p])
    current = (<any>current)[p]
  });

  (<any>current)[path[path.length - 1]] = replaceReference((<any>current)[path[path.length - 1]]);
  (<any>current)[path[path.length - 1]] = value

  return clone
}

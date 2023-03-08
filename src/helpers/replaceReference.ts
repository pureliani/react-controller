export const replaceReference = <S>(state: S): S => {
  if (typeof state !== 'object') return state
  else if(Array.isArray(state)) return Object.assign([], state)
  else if(state instanceof Date) {return new Date(state.getTime()) as S}
  else if(state instanceof Set) {return new Set(state) as S}
  else if(state instanceof Map) {return new Map(state) as S}
  else return Object.assign({}, state)
}

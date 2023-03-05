export const replaceReference = <S>(state: S): S => {
  if (typeof state !== 'object') return state
  if(Array.isArray(state)) return Object.assign([], state)
  else return Object.assign({}, state)
}
  

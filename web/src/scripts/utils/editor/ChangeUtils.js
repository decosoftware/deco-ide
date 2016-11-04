
const getLastChangeOrigin = (changes) => changes[changes.length - 1].origin

// Return true if these changes are from user input
export const containsUserInputChange = (changes) => {
  const origin = getLastChangeOrigin(changes)

  // http://stackoverflow.com/questions/26174164/auto-complete-with-codemirrror
  return origin === '+input' || origin === '+delete'
}

// Return true if these changes are from changing a prop
export const containsDecoPropChange = (changes) => {
  const origin = getLastChangeOrigin(changes)

  return origin === '+decoProp'
}

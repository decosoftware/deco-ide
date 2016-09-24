export const withoutProtocol = (uri) => {
  const index = uri.indexOf('://')

  if (index > 0) {
    return uri.slice(index + 3)
  } else {
    return null
  }
}

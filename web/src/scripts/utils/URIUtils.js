export const filePathToURI = (filePath) => {
  return 'file://' + filePath
}

export const createUrlParams = (params) => {
  return Object.keys(params).map(key => {
    return `${key}=${encodeURIComponent(params[key])}`
  }).join('&')
}

export const createUrl = (baseUrl, params) => {
  return `${baseUrl}` + (params ? `?${createUrlParams(params)}` : '')
}

export const parseQueryString = (url) => {
  const params = {}
  const query = url.split('?')[1]

  if (!query) {
    return params
  }

  const components = query.split("&")

  components.forEach(component => {
    const pair = component.split("=")
    const key = decodeURIComponent(pair[0])
    const value = decodeURIComponent(pair[1])

    // Param may exist - there are potentially multiple with the same name
    const existing = params[key]

    if (typeof existing === 'undefined') {
      params[key] = value
    } else if (typeof existing === 'string') {
      params[key] = [existing, value]
    } else {
      params[key].push(value)
    }
  })

  return params
}

export const withoutProtocolOrParams = (uri) => {
  uri = withoutProtocol(uri)
  uri = withoutParams(uri)
  return uri
}

export const withoutProtocol = (uri) => {
  const index = uri.indexOf('://')

  if (index > 0) {
    return uri.slice(index + 3)
  } else {
    return uri
  }
}

export const withoutParams = (uri) => {
  const index = uri.indexOf('?')

  if (index >= 0) {
    return uri.slice(0, index)
  } else {
    return uri
  }
}

export const getParam = (uri, key) => {
  return parseQueryString(uri)[key]
}

export const matchesResource = (a, b) => {
  return withoutParams(a) === withoutParams(b)
}

// Replace the resource of oldURI with newURI, while keeping the same params
export const replaceResource = (oldURI, newURI) => {
  return oldURI.replace(withoutParams(oldURI), withoutParams(newURI))
}

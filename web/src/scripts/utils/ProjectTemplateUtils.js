import path from 'path'
const fs = Electron.remote.require('fs')
const menuHandler = Electron.remote.require('./menu/menuHandler')

export const setApplicationMenuForTemplate = (projectTemplateType) => {
  menuHandler.instantiateTemplate({projectTemplateType})
}

export const detectTemplate = (rootPath) => {
  const exponentJSON = path.resolve(rootPath, 'exp.json')

  try {
    fs.statSync(exponentJSON)

    return 'Exponent'
  } catch (e) {
    ;
  }

  return 'React Native'
}

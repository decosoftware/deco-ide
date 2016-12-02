import path from 'path'
const fs = Electron.remote.require('fs')
const menuHandler = Electron.remote.require('./menu/menuHandler')

import * as Exponent from './Exponent'
import * as ProjectTemplateConstants from '../constants/ProjectTemplateConstants'

export const setApplicationMenuForTemplate = (projectTemplateType) => {
  menuHandler.instantiateTemplate({projectTemplateType})
}

export const detectTemplate = (rootPath) => {
  const exponentJSON = path.resolve(rootPath, 'exp.json')

  try {
    fs.statSync(exponentJSON)

    return ProjectTemplateConstants.CATEGORY_EXPONENT
  } catch (e) {
    ;
  }

  return ProjectTemplateConstants.CATEGORY_REACT_NATIVE
}

export const isValidProjectName = (projectName, projectTemplateType) => {
  if (projectName.length === 0) {
    return false
  }

  if (projectTemplateType === ProjectTemplateConstants.CATEGORY_EXPONENT) {
    return Exponent.isValidProjectName(projectName)
  }

  return !!projectName[0].match(/[A-Z]/)
}

export const sanitizeProjectName = (projectName, projectTemplateType) => {
  if (projectTemplateType === ProjectTemplateConstants.CATEGORY_EXPONENT) {
    return Exponent.sanitizeProjectName(projectName)
  }

  const upperFirstName = projectName.length > 0
    ? projectName[0].toUpperCase() + projectName.slice(1)
    : projectName

  return upperFirstName.replace(/[^a-zA-Z0-9_-]/g, '')
}

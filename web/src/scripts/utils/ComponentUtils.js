import _ from 'lodash'

export default class {

  // Remove exact duplicates (same revision)
  static removeDuplicates(components) {
    return _.uniqBy(components, 'revisionId')
  }

  static deleteFromList(components, component) {
    const {revisionId} = component
    return _.reject(components, ['revisionId', revisionId])
  }

  static updateInList(components, component) {
    const {revisionId} = component
    const existingIndex = _.findIndex(components, ['revisionId', revisionId])

    if (existingIndex === -1) {
      console.warn(`Failed to update component: not in the components list`)
      return components
    }

    return [
      ...components.slice(0, existingIndex),
      component,
      ...components.slice(existingIndex + 1, components.length),
    ]
  }
}

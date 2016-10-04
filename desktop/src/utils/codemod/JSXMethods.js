import j from 'jscodeshift'
import _ from 'lodash'

import { createArgumentNodes } from './nodeUtils'

// lets remember to start lines at 0

const createJSXAttribute = (attributeName, value) => {
  return j.jsxAttribute(
    j.jsxIdentifier(attributeName),
    j.jsxExpressionContainer(createArgumentNodes([value])[0])
  )
}

function findJSXElementByLine(line) {
  return this.find(j.JSXElement).paths().find((node) => {
    return node.value.loc.start.line === line
  })
}

// Finds the start and end indices of the newly added string
// within the complete string.
// Returns [startIndex, endIndex] (start inclusive, end exclusive)
function diffStrings(oldString, appendedString) {
  let startIndex = 0
  for (let i = 0; i < oldString.length; i++) {
    if (appendedString[i] !== oldString[i]) {
      startIndex = i
      break
    }
  }
  const endIndex = appendedString.length - oldString.length + startIndex
  return {start: startIndex, end: endIndex}
}

// Returns all indices of regex in str
function getMatchIndices(regex, str) {
   var result = [];
   var match;
   regex = new RegExp(regex);
   while (match = regex.exec(str))
      result.push(match.index);
   return result;
}

const getModifiedToSource = (oldSource, newSource) => {
  // Strip newlines from both old and new generated source, so we can
  // compare indices across them.
  const strippedOldSource = oldSource.replace(/\n/g, '')
  const strippedNewSource = newSource.replace(/\n/g, '')
  let sourceByWhitespace = getMatchIndices(/\n/g, oldSource)

  // Find where the new element is within the newly built JSX element
  const stringDiff = diffStrings(strippedOldSource, strippedNewSource)

  return () => {
    let newOutput = ""
    let deletedIndex = 0
    let i = 0
    while (i < strippedNewSource.length) {
      if (i >= stringDiff.start && i < stringDiff.end) {
        // This character is newly appended, so we're write it to the output.
        // Then we increment all indices of whitespace in the original, as we've
        // now inserted a character ahead of each of those instances
        newOutput += strippedNewSource[i]
        sourceByWhitespace = _.map(sourceByWhitespace, ind => ind + 1)
        i++
      } else if (sourceByWhitespace.includes(i)) {
        // This character is at a whitespace index, so we need to add a
        // newline. Then, we'll remove that newline location from the set of
        // newlines to be added. Finally, we'll decrement the other whitespace
        // source indices, because we've inserted a newline ahead of each instance
        newOutput += '\n'
        delete sourceByWhitespace[deletedIndex]
        deletedIndex++
        sourceByWhitespace = _.map(sourceByWhitespace, ind => ind - 1)
      } else {
        // This character is the same as it was in the old element,
        // so we just put it in the new output
        newOutput += strippedNewSource[i]
        i++
      }
    }
    return newOutput
  }
}

export function addJSXAttribute(line, attributeName, value) {
  const matchingElement = findJSXElementByLine.call(this, line)
  if (!matchingElement) return this

  // const oldSource = this.toSource()

  // Build new element and append it to the front of JSX element
  const newElement = createJSXAttribute(attributeName, value)
  matchingElement.value.openingElement.attributes.unshift(newElement)

  return this
  // const newSource = this.toSource()

  // // We override toSource on this, so that we can handle lost newlines appropriately
  // const newThis = _.clone(this)
  // newThis.toSource = getModifiedToSource(oldSource, newSource)
  // return newThis
}

export function updateJSXAttribute(line, attributeName, value) {
  const matchingElement = findJSXElementByLine.call(this, line)
  if (!matchingElement) return this

  const attributes = matchingElement.value.openingElement.attributes
  const matchingAttributeIndex = _.findIndex(attributes, (att) => att.name.name === attributeName)
  if (!matchingAttributeIndex) return this

  const newAttribute = createJSXAttribute(attributeName, value)

  // const oldSource = this.toSource()
  attributes[matchingAttributeIndex] = newAttribute
  // const newSource = this.toSource()

  return this
  // const newThis = _.clone(this)
  // newThis.toSource = getModifiedToSource(oldSource, newSource)
  // return newThis
}

const getRemoveModifiedToSource = (oldSource, newSource) => {
  const strippedOldSource = oldSource.replace(/\n/g, '')
  const strippedNewSource = newSource.replace(/\n/g, '')

  console.log(strippedOldSource)
  console.log(strippedNewSource)

  return () => {
    return ""
  }
}

export function removeJSXAttribute(line, attributeName) {
  const matchingElement = findJSXElementByLine.call(this, line)
  if (!matchingElement) return this

  const attributes = matchingElement.value.openingElement.attributes

  const matchingAttributeIndex = _.findIndex(attributes, (att) => att.name.name === attributeName)
  if (!matchingAttributeIndex) return this

  // const value = attributes[matchingAttributeIndex].value.expression.value
  // const oldSource = this.toSource()
  attributes.splice(matchingAttributeIndex, 1)
  // const newSource = this.toSource()

  return this
  // const newThis = _.clone(this)
  // newThis.toSource = getRemoveModifiedToSource(oldSource, newSource)
  // return newThis
}

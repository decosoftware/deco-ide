/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import _ from 'lodash'
import Display from '../events/Display'

const SIMPLE_PROPERTY_RE = /^(\d+)(px)?(%)?$/

const scaleProperty = (value) => {
  const type = typeof value
  if (type === 'number') {
    return value * Display.scale
  } else if (type === 'string') {
    const match = value.match(SIMPLE_PROPERTY_RE)
    if (match) {
      const number = parseInt(match[1])
      if (! _.isNaN(number)) {
        const result = '' + number * Display.scale
        if (match[2]) {
          return result + 'px'
        } else if (match[3]) {
          return result + '%'
        } else {
          return result
        }
      }
    }
  }
  return value
}

const scaleMultipleProperty = (value) => {
  const properties = value.split(' ')
  return properties.map(scaleProperty).join(' ')
}

const propertyTransforms = {
  width: scaleProperty,
  height: scaleProperty,
  borderRadius: scaleProperty,
  borderTopRightRadius: scaleProperty,
  borderTopLeftRadius: scaleProperty,
  borderBottomRightRadius: scaleProperty,
  borderBottomLeftRadius: scaleProperty,
  fontSize: scaleProperty,
  lineHeight: scaleProperty,
  WebkitMaskSize: scaleMultipleProperty,
}

const scaleForRetina = (style, isTopLevel = true) => {
  style = _.cloneDeep(style)

  if (! Display.isRetina) {
    return style
  }

  const scaledStyle = _.mapValues(style, (value, key) => {
    if (propertyTransforms[key] != null) {
      return propertyTransforms[key](value)
    }
    return value
  })

  if (isTopLevel) {
    scaledStyle.transform = 'translate3d(0,0,0) scale(0.5)'
    scaledStyle.transformOrigin = '0 0'
  }

  return scaledStyle
}

const scaleAndApplyStylesForRetina = (style, styles = {}, isTopLevel) => {
  let scaledStyle = scaleForRetina(style, isTopLevel)

  if (Display.isRetina) {
    if (styles.x2) {
      scaledStyle = _.extend({}, scaledStyle, styles.x2)
    }
  } else {
    if (styles.x1) {
      scaledStyle = _.extend({}, scaledStyle, styles.x1)
    }
  }

  return scaledStyle
}

export {
  scaleForRetina,
  scaleAndApplyStylesForRetina,
}

// let testStyle = {width: 10, height: '10px', oobleck: 10, WebkitMaskSize: '10px 20px'}
// console.log('testStyle', scaleForRetina(testStyle))

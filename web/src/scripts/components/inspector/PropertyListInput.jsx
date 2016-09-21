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
import React, { Component } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'
import update from 'react-addons-update'

import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import Property from './Property'
import ValueInput from '../input/ValueInput'
import StringInput from '../input/StringInput'

const stylesCreator = ({colors, fonts}) => ({
  content: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    display: 'flex',
    paddingLeft: 15,
    marginTop: 5,
    borderLeft: `2px solid ${colors.divider}`
  },
  actions: {
    flex: 0,
    flexDirection: 'row',
    display: 'flex',
  },
  actionText: {
    ...fonts.regular,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyListInput extends Component {

  static defaultProps = {
    value: [],
    template: (props) => ({
      name: 'hello',
      type: 'string',
      editWith: 'inputField',
      value: 'world',
    }),
    dividerType: 'none',
  }

  onKeyChange = (i, key, updated) => {
    const {value} = this.props

    this.onChange(i, update(value[i], {
      [key]: {$set: updated}
    }))
  }

  onChange = (i, prop) => {
    const {onChange, value} = this.props

    const updated = update(value, {
      [i]: {$set: prop}
    })

    onChange(updated)
  }

  onAdd = () => {
    const {onChange, value, template} = this.props

    const property = template(value)
    const updated = update(value, {$push: [property]})

    onChange(updated)
  }

  onRemove = (i) => {
    const {onChange, value} = this.props

    const updated = update(value, {$splice: [[i, 1]]})

    onChange(updated)
  }

  getListActions = _.memoize(() => ({
    add: this.onAdd,
    change: this.onChange,
  }))

  getChildActions = _.memoize((i) => ({
    remove: this.onRemove.bind(this, i),
    changeKey: this.onKeyChange.bind(this, i),
  }))

  renderPropertyList() {
    const {styles, value, renderRow} = this.props

    return value.map((prop, i) => {
      const element = renderRow(prop, this.getChildActions(i), i)

      if (element.key) {
        return element
      } else {
        // Key by index if the element doesn't have a key
        return React.cloneElement(element, {key: i})
      }
    })
  }

  renderActions() {
    const {styles, renderActions} = this.props
    const listActions = this.getListActions()

    if (typeof renderActions === 'function') {
      return renderActions(listActions)
    } else if (typeof renderActions !== 'undefined' && !renderActions) {
      return renderActions
    }

    // Render default actions
    return (
      <div
        style={styles.actionText}
        onClick={listActions.add}
      >
        Add
      </div>
    )
  }

  render() {
    const {styles, title, dividerType} = this.props

    return (
      <PropertyField
        title={title}
        dividerType={dividerType}
        actions={this.renderActions()}
      >
        <div style={styles.content}>
          {this.renderPropertyList()}
        </div>
      </PropertyField>
    )
  }
}

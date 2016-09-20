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

import React, { Component } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'
import update from 'react-addons-update'

import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import Property from './Property'

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
  spacer: {
    marginBottom: 30,
  },
  actionText: {
    ...fonts.regular,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyListInput extends Component {

  static defaultProps = {
    title: '',
    value: [],
    template: (props) => ({
      name: 'hello',
      type: 'string',
      editWith: 'inputField',
      value: 'world',
    })
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

    const updated = update(value, {$splice: [[0, 1]]})

    onChange(updated)
  }

  renderPropertyList() {
    const {styles, value} = this.props
    const elements = []

    for (let i = 0; i < value.length; i++) {
      const prop = value[i]

      i > 0 && elements.push(
        <div style={styles.spacer} key={`spacer-${i}`} />
      )

      elements.push(
        <Property
          // Key by index, since name isn't guaranteed to be unique
          key={i}
          prop={prop}
          onChange={this.onChange.bind(this, i)}
          actions={(
            <div
              style={styles.actionText}
              onClick={this.onRemove.bind(this, i)}
            >
              Remove
            </div>
          )}
        />
      )
    }

    return elements
  }

  render() {
    const {styles, title, dividerType} = this.props

    return (
      <PropertyField
        title={title}
        dividerType={'none'}
        actions={(
          <div
            style={styles.actionText}
            onClick={this.onAdd}
          >
            Add Property
          </div>
        )}
      >
        <div style={styles.content}>
          {this.renderPropertyList()}
        </div>
      </PropertyField>
    )
  }
}

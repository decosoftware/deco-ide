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
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'

import { ComponentMenuItem } from '../components'
import ComponentProps from './ComponentProps'

const stylesCreator = ({colors}) => ({
  container: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  properties: {
    paddingLeft: 15,
    paddingRight: 15,
    overflowY: 'auto',
  },
})

const mapStateToProps = (state) => createSelector(
  () => ({
    component: {
      name: 'Component',
      item: null,
    },
  })
)

@StylesEnhancer(stylesCreator)
class ComponentInspector extends Component {
  render() {
    const {style, styles, width, decoDoc, component} = this.props

    return (
      <div style={{...style, ...styles.container}}>
        <ComponentMenuItem
          name={component.name}
          item={component.item}
        />
        <div style={styles.properties}>
          <ComponentProps
            decoDoc={decoDoc}
            width={width - 30}
          />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(ComponentInspector)

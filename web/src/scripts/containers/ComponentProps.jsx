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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { batchActions } from 'redux-batched-subscribe'

import {
  SimpleButton,
  NoContent,
  Property,
} from '../components'

import * as selectors from '../selectors'
import PropUtils from '../utils/PropUtils'
import { elementTreeActions, textEditorCompositeActions } from '../actions'
import { CONTENT_PANES } from '../constants/LayoutConstants'

const stylesCreator = ({fonts}) => ({
  main: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
  },
  inner: {
    flex: '1 1 auto',
    overflowX: 'hidden',
    overflowY: 'auto',
    minHeight: 0,
    minWidth: 0,
  },
  spacer: {
    height: 30,
  },
  actions: {
    flexDirection: 'row',
    display: 'flex',
  },
  actionText: {
    ...fonts.regular,
  },
  actionSpacer: {
    marginRight: 15,
  },
})

const mapStateToProps = (state) => createSelector(
  selectors.currentDoc,
  selectors.selectedElement,
  selectors.selectedComponent,
  (decoDoc, element, component) => ({
    decoDoc,
    element,
    component,
  })
)

const mapDispatchToProps = (dispatch) => ({
  elementTreeActions: bindActionCreators(elementTreeActions, dispatch),
  textEditorCompositeActions: bindActionCreators(textEditorCompositeActions, dispatch),
  dispatch,
})

@StylesEnhancer(stylesCreator)
class ComponentProps extends Component {

  static defaultProps = {
    element: null,
    component: null,
    decoDoc: null,
    scrollable: true,
  }

  handleValueChange(prop, value) {
    const {decoDoc, element, dispatch} = this.props

    if (! decoDoc || ! element) return

    const {text, range, value: newValue} = PropUtils.getPropTextUpdate(prop, value)

    dispatch(batchActions([
      textEditorCompositeActions.setTextForRange(decoDoc.id, text, range),
      elementTreeActions.updateProp(decoDoc.id, element, prop, newValue, text),
    ]))
  }

  removeProp = (prop) => {
    const {decoDoc, element} = this.props

    PropUtils.removeProp(decoDoc, element, prop)
  }

  addProp = (prop) => {
    const {decoDoc, element} = this.props

    PropUtils.addProp(decoDoc, element, prop)
  }

  renderPropActions(prop, exists) {
    const {styles} = this.props

    return (
      <div style={styles.actions}>
        {exists ? (
          <div
            style={styles.actionText}
            onClick={this.removeProp.bind(this, prop)}
          >
            Remove Prop
          </div>
        ) : (
          <div
            style={styles.actionText}
            onClick={this.addProp.bind(this, prop)}
          >
            Add Prop
          </div>
        )}
      </div>
    )
  }

  renderProp(prop, exists) {
    if (!prop) return

    const {styles} = this.props
    const {name} = prop

    return (
      <Property
        key={name}
        prop={prop}
        disabled={!exists}
        onValueChange={this.handleValueChange.bind(this, prop)}
        actions={this.renderPropActions(prop, exists)}
      />
    )
  }

  renderPropList(existingProps = [], possibleProps = []) {
    const {styles} = this.props

    return [
      ...existingProps.map(prop => this.renderProp(prop, true)),
      ...possibleProps.map(prop => this.renderProp(prop, false)),
    ].reduce((acc, element, i) => {

      // Add a spacer between each element
      const spacer = (
        <div key={i} style={styles.spacer} />
      )

      acc.push(spacer)
      acc.push(element)

      return acc
    }, [])
  }

  renderProps() {
    const {styles, component, element, scrollable} = this.props

    const innerStyle = {...styles.inner, overflowY: scrollable ? 'auto' : 'hidden'}

    // We have an element, but couldn't match it to a component in the registry
    if (element && !component) {
      if (element.props.length > 0) {
        return (
          <div style={innerStyle}>
            {this.renderPropList(element.props)}
          </div>
        )
      } else {
        return <NoContent>No props</NoContent>
      }

    // There's a component in the registry
    } else if (component) {

      // Existing props
      const propsByName = element && _.keyBy(element.props, 'name')
      const matched = {}
      const existingProps = []
      const possibleProps = []

      component.props && component.props.forEach((prop) => {
        const {name, value, type} = prop

        // Find metadata for this prop from the component list
        if (propsByName) {
          const matchingProp = propsByName[name]

          // If it has same type, merge the metadata from the component list
          if (matchingProp) {
            matched[name] = true

            if (matchingProp.type === type) {
              existingProps.push({
                ...prop,
                ...matchingProp,
              })
            } else {
              existingProps.push(matchingProp)
            }

            return
          }
        }

        possibleProps.push(prop)
      })

      element && element.props.forEach((prop) => {
        if (!name) return

        const {name} = prop

        if (!matched[name]) {
          existingProps.push(prop)
        }
      })

      // Render props with existing first
      if (existingProps.length > 0 || possibleProps.length > 0) {
        return (
          <div style={innerStyle}>
            {this.renderPropList(existingProps, possibleProps)}
          </div>
        )
      } else {
        return <NoContent>No props</NoContent>
      }
    }
  }

  render() {
    const {styles, decoDoc} = this.props

    return (
      <div style={styles.main}>
        {this.renderProps()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ComponentProps)

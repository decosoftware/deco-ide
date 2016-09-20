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
import update from 'react-addons-update'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

import InspectorButton from '../buttons/InspectorButton'
import PropertyStringInput from '../inspector/PropertyStringInput'
import PropertyComponentPropsInput from '../inspector/PropertyComponentPropsInput'
import PropertyDependenciesInput from '../inspector/PropertyDependenciesInput'
import PropertyImportsInput from '../inspector/PropertyImportsInput'
import ComponentCodePreview from '../inspector/ComponentCodePreview'

const stylesCreator = ({colors}) => ({
  container: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inner: {
    flex: '1 1 auto',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 15,
  },
  padded: {
    padding: 10,
  },
  footer: {
    flex: '0 0 auto',
    padding: 10,
    borderStyle: 'solid',
    borderColor: colors.dividerInverted,
    borderWidth: 0,
    borderTopWidth: 1,
  },
  code: {
    background: 'rgb(38,40,42)',
    color: 'white',
    padding: 10,
    lineHeight: 'initial',
    fontFamily: '"Roboto Mono", monospace',
    fontSize: 12,
    borderRadius: 3,
  },
  spacer: {
    marginBottom: 30,
  },
  spacerSmall: {
    marginBottom: 10,
  }
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class extends Component {
  constructor(props) {
    super()

    const {component} = props

    this.state = {
      component: _.cloneDeep(component),
    }
  }

  save(component) {
    console.log('updating', component)
    const {onUpdateComponent} = this.props

    this.setState({component})
    onUpdateComponent(component)
  }

  render() {
    const {styles, onDeleteComponent} = this.props
    const {component} = this.state

    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <PropertyStringInput
            title={'Name'}
            value={component.name}
            onChange={(value) => this.save(update(component, {
              name: {$set: value},
            }))}
          />
          <div style={styles.spacer} />
          <PropertyStringInput
            title={'JSX Tag'}
            value={component.tagName}
            onChange={(value) => this.save(update(component, {
              tagName: {$set: value},
            }))}
          />
          <div style={styles.spacer} />
          <PropertyStringInput
            title={'Description'}
            value={component.description}
            onChange={(value) => this.save(update(component, {
              description: {$set: value},
            }))}
          />
          <div style={styles.spacer} />
          <PropertyComponentPropsInput
            title={'Props'}
            value={component.props}
            onChange={(value) => this.save(update(component, {
              props: {$set: value},
            }))}
          />
          <div style={styles.spacer} />
          <PropertyDependenciesInput
            title={'Dependencies'}
            value={component.dependencies}
            onChange={(value) => this.save(update(component, {
              dependencies: {$set: value},
            }))}
          />
          <div style={styles.spacer} />
          <PropertyImportsInput
            title={'Imports'}
            value={component.imports}
            onChange={(value) => this.save(update(component, {
              imports: {$set: value},
            }))}
          />
          <div style={styles.spacer} />
        </div>
        <div style={styles.footer}>
          <ComponentCodePreview component={component} />
          <div style={styles.spacerSmall} />
          <InspectorButton type={'main'}>Publish Component</InspectorButton>
          <div style={styles.spacerSmall} />
          <InspectorButton
            type={'destructive'}
            onClick={onDeleteComponent.bind(null, component)}
          >
            Delete Component
          </InspectorButton>
        </div>
      </div>
    )
  }
}

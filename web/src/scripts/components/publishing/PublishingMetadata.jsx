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

import { createJSX } from '../../factories/module/TemplateFactory'
import PrimitiveTypes from '../../constants/PrimitiveTypes'
import FormRow from '../forms/FormRow'
import FormHeader from '../forms/FormHeader'
import FormHeaderPlusButton from '../forms/FormHeaderPlusButton'
import LiveValue from '../inspector/LiveValue'
import InspectorButton from '../buttons/InspectorButton'
import InspectorField from '../inspector/InspectorField'
import FileSelectorInput from '../input/FileSelectorInput'
import StringInput from '../input/StringInput'
import NameEditor from '../inspector/NameEditor'
import PropertyStringInput from '../inspector/PropertyStringInput'
import PropertyListInput from '../inspector/PropertyListInput'

const INPUT_WIDTH = 115
const INSET_WIDTH = 15

const styles = {
  container: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 15,
  },
  inner: {
    flex: '1 1 auto',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  padded: {
    padding: 10,
  },
  footer: {
    flex: '0 0 auto',
    padding: 10,
    borderStyle: 'solid',
    borderColor: 'rgb(229,229,229)',
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
  }
}

const castType = (value, oldType, newType) => {
  try {
    switch (newType) {
      case PrimitiveTypes.BOOLEAN: return !!value
      case PrimitiveTypes.NUMBER: {
        const parsed = parseFloat(value)
        return isNaN(parsed) ? 0 : parsed
      }
      case PrimitiveTypes.STRING: return value.toString()
      case PrimitiveTypes.OBJECT: return []
      case PrimitiveTypes.ARRAY: return []
      case PrimitiveTypes.FUNCTION: return value.toString()
      case PrimitiveTypes.RAW: return value.toString()
    }
  } catch (e) {
    switch (newType) {
      case PrimitiveTypes.BOOLEAN: return false
      case PrimitiveTypes.NUMBER: return 0
      case PrimitiveTypes.STRING: return ''
      case PrimitiveTypes.OBJECT: return []
      case PrimitiveTypes.ARRAY: return []
      case PrimitiveTypes.FUNCTION: return '() => {}'
      case PrimitiveTypes.RAW: return ''
    }
  }

  return null
}

export default class extends Component {
  constructor(props) {
    super()

    const {component} = props

    this.state = {
      component: _.cloneDeep(component),
    }
  }

  renderCode(component) {
    const {tagName, props, dependencies, imports} = component

    const chunks = [
      _.map(imports, (value, key) => {
        if (_.isString(value)) {
          return `import ${value} from '${key}'`
        } else if (_.isArray(value)) {
          return `import { ${value.join(', ')} } from '${key}'`
        }
      }).join('\n'),
      createJSX({tagName, props}),
    ]

    return (
      <pre style={styles.code} key={'code'}>{chunks.join('\n\n')}</pre>
    )
  }

  renderMap(map, mapName) {
    const {component} = this.state
    const {width} = this.props

    return _.map(map, (value, key) => {
      let inputElement

      if (_.isString(value)) {
        inputElement = (
          <StringInput
            value={value}
            onChange={(newValue) => this.updateComponent(c => c[mapName][key] = newValue)}
          />
        )
      } else if (_.isArray(value)) {
        inputElement = (
          <StringInput
            value={value.join(',')}
            onChange={(newValue) => {
              this.updateComponent(c => {
                try {
                  const parts = newValue.split(',')
                  c[mapName][key] = parts
                } catch (e) {
                  console.log('failed to change', value, '=>', newValue)
                }
              })
            }}
          />
        )
      }

      return (
        <InspectorField
          key={key}
          name={key}
          inset={INSET_WIDTH}
          width={width}
          deletable={true}
          inputElement={inputElement}
          menuElement={(
            <NameEditor
              name={key}
              withConfirmation={true}
              onChange={(newKey) => {
                this.updateComponent(c => {
                  delete c[mapName][key]
                  c[mapName][newKey] = value
                })
              }}
            />
          )}
          onDelete={() => this.updateComponent(c => delete c[mapName][key])}
        />
      )
    })
  }

  updateComponent(updater) {
    const {onUpdateComponent} = this.props
    const {component} = this.state
    const clone = _.cloneDeep(component)
    updater(clone)
    this.setState({component: clone})
    onUpdateComponent(clone)
  }

  save(component) {
    console.log('updating', component)
    const {onUpdateComponent} = this.props

    this.setState({component})
    onUpdateComponent(component)
  }

  render() {
    const {width, onDeleteComponent} = this.props
    const {component} = this.state
    const {props: componentProps = [], dependencies, imports} = component

    const rowDimensions = {
      labelWidth: width - INPUT_WIDTH - 10,
      inset: INSET_WIDTH,
      inputWidth: INPUT_WIDTH,
    }

    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <InspectorButton>Scan Current File</InspectorButton>
          <FormHeader label={'METADATA'} />
          <div style={styles.spacer} />
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
          <PropertyListInput
            title={'Props'}
            value={component.props}
            onChange={(value) => this.save(update(component, {
              props: {$set: value},
            }))}
          />
          <FormHeader label={'PROPS'}>
            <FormHeaderPlusButton
              onClick={() => {
                this.updateComponent(c => {
                  c.props = c.props || []
                  c.props.push({
                    name: 'hello',
                    type: 'string',
                    editWith: 'inputField',
                    defaultValue: 'world',
                  })
                })
              }}
            />
          </FormHeader>
          {componentProps.map((prop, i) => {
            const {name, defaultValue: value, type} = prop
            const isObject = type === PrimitiveTypes.OBJECT

            const elements = [(
              <LiveValue
                key={i}
                id={name}
                value={value}
                metadata={prop}
                width={width}
                inset={INSET_WIDTH}
                disabledFields={['group']}
                addable={isObject}
                deletable={true}
                onChange={(value) => this.updateComponent(c => c.props[i].defaultValue = value)}
                onMetadataChange={(key, newValue) => {
                  this.updateComponent(c => {
                    c.props[i][key] = newValue
                    if (key === 'type') {
                      const previousValue = c.props[i].defaultValue
                      c.props[i].defaultValue = castType(previousValue, value, newValue)
                    }
                  })
                }}
                onDelete={(value) => this.updateComponent(c => c.props.splice(i, 1))}
                onAdd={() => {
                  this.updateComponent(c => {
                    c.props[i].defaultValue = c.props[i].defaultValue || []
                    c.props[i].defaultValue.push({
                      name: 'hello',
                      type: 'string',
                      editWith: 'inputField',
                      defaultValue: 'world',
                    })
                  })
                }}
              />
            )]

            if (isObject) {
              _.each(value, (oProp, oi) => {
                const {name, defaultValue: value, type} = oProp

                elements.push(
                  <LiveValue
                    key={i + '-' + oi}
                    id={name}
                    value={value}
                    metadata={oProp}
                    width={width}
                    inset={INSET_WIDTH * 2}
                    disabledFields={['group']}
                    deletable={true}
                    onChange={(value) => this.updateComponent(c => c.props[i].defaultValue[oi].defaultValue = value)}
                    onMetadataChange={(key, newValue) => {
                      this.updateComponent(c => {
                        c.props[i].defaultValue[oi][key] = newValue
                        if (key === 'type') {
                          const previousValue = c.props[i].defaultValue[oi].defaultValue
                          c.props[i].defaultValue[oi].defaultValue = castType(previousValue, value, newValue)
                        }
                      })
                    }}
                    onDelete={(value) => this.updateComponent(c => c.props[i].defaultValue.splice(oi, 1))}
                  />
                )
              })
            }

            return _.flatten(elements)
          })}
          <div style={{marginBottom: 20}} />
          <FormHeader label={'DEPENDENCIES'}>
            <FormHeaderPlusButton
              onClick={() => {
                this.updateComponent(c => {
                  c.dependencies = c.dependencies || {}
                  let newDependencyName = 'left-pad'
                  while (typeof c.dependencies[newDependencyName] !== 'undefined') {
                    newDependencyName += '-copy'
                  }
                  c.dependencies[newDependencyName] = '^1.1.1'
                })
              }}
            />
          </FormHeader>
          {this.renderMap(dependencies, 'dependencies')}
          <div style={{marginBottom: 20}} />
          <FormHeader label={'IMPORTS'}>
            <FormHeaderPlusButton
              onClick={() => {
                this.updateComponent(c => {
                  c.imports = c.imports || {}
                  let newImportName = 'react-native'
                  while (typeof c.imports[newImportName] !== 'undefined') {
                    newImportName += '-copy'
                  }
                  c.imports[newImportName] = ['View']
                })
              }}
            />
          </FormHeader>
          {this.renderMap(imports, 'imports')}
        </div>
        <div style={styles.footer}>
          {this.renderCode(component)}
          <div style={{marginBottom: 10}} />
          <InspectorButton type={'main'}>Publish Component</InspectorButton>
          <div style={{marginBottom: 10}} />
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

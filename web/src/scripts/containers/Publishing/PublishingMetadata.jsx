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

import React, { Component, } from 'react'
import { connect } from 'react-redux'

import {
  FormRow,
  FormHeader,
  FormHeaderPlusButton,
  LiveValue,
  InspectorButton,
  InspectorField,
  FileSelectorInput,
  StringInput,
  NameEditor,
} from '../../components'

const INPUT_WIDTH = 115
const INSET_WIDTH = 15

const styles = {
  container: {
    display: 'flex',
    flex: '1 0 auto',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  inner: {
    flex: '1 1 0',
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
  }
}

class PublishingMetadata extends Component {
  constructor() {
    super()

    this.state = {}
  }

  renderCode(component) {
    const {props, dependencies, imports} = component

    const createJSX = () => {
      return [
        '<Button',
        ..._.map(props, ({value, metadata: {name}}) => `  ${name}={${value}}`),
        '/>',
      ].join('\n')
    }

    const chunks = [
      _.map(imports, (value, key) => `import ${value} from ${key}`).join('\n'),
      createJSX(),
    ]

    return (
      <pre style={styles.code} key={'code'}>{chunks.join('\n\n')}</pre>
    )
  }

  renderMap(map) {
    const {width} = this.props

    return _.map(map, (value, key) => {
      return (
        <InspectorField
          key={key}
          name={key}
          inset={INSET_WIDTH}
          width={width}
          inputElement={(
            <StringInput
              value={value}
              onChange={(value) => {console.log('value', value)}}
            />
          )}
          menuElement={(
            <NameEditor
              name={key}
              onChange={(value) => {console.log('name change', value)}}
            />
          )}
        />
      )
    })
  }

  render() {
    const {width, component} = this.props
    const {props: componentProps, dependencies, imports} = component

    const rowDimensions = {
      labelWidth: width - INPUT_WIDTH - 10,
      inset: INSET_WIDTH,
      inputWidth: INPUT_WIDTH,
    }

    return (
      <div style={styles.container}>
        <div style={styles.inner}>
          <div style={styles.padded}>
            <InspectorButton>Scan Current File</InspectorButton>
          </div>
          <FormHeader label={'COMPONENT FILES'} />
          <FormRow label={'Entry file'} {...rowDimensions}>
            <FileSelectorInput
              value={'./Button'}
              placeholder={'Path to entry'}
              buttonText={'...'}
              width={INPUT_WIDTH}
            />
          </FormRow>
          <div style={{marginBottom: 20}} />
          <FormHeader label={'METADATA'} />
          <FormRow label={'Package / Import name'} {...rowDimensions}>
            <StringInput
              value={'react-native-button'}
              onChange={(value) => {console.log('value', value)}}
            />
          </FormRow>
          <FormRow label={'GitHub Repository'} {...rowDimensions}>
            <StringInput
              value={'dabbott/button'}
              onChange={(value) => {console.log('value', value)}}
            />
          </FormRow>
          <FormRow label={'Tagname'} {...rowDimensions}>
            <StringInput
              value={'Button'}
              onChange={(value) => {console.log('value', value)}}
            />
          </FormRow>
          <div style={{marginBottom: 20}} />
          <FormHeader label={'PROPS'}>
            <FormHeaderPlusButton
              onClick={() => {console.log('add prop')}}
            />
          </FormHeader>
          {componentProps.map(({value, metadata}, i) => {
            const {name} = metadata

            return (
              <LiveValue
                id={name}
                key={name}
                value={value}
                metadata={metadata}
                width={width}
                inset={INSET_WIDTH}
                disabledFields={['group']}
                onChange={(value) => {console.log('change', value)}}
                onMetadataChange={(value) => {console.log('meta change', value)}}
              />
            )
          })}
          <div style={{marginBottom: 20}} />
          <FormHeader label={'DEPENDENCIES'} />
          {this.renderMap(dependencies)}
          <div style={{marginBottom: 20}} />
          <FormHeader label={'IMPORTS'} />
          {this.renderMap(imports)}
        </div>
        <div style={styles.footer}>
          {this.renderCode(component)}
          <div style={{marginBottom: 10}} />
          <InspectorButton type={'main'}>Publish Component</InspectorButton>
        </div>
      </div>
    )
  }
}

export default connect()(PublishingMetadata)

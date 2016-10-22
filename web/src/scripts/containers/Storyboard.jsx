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

import React, { Component, PropTypes, } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import YOPS from 'yops'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import path from 'path'
import { ViewportUtils } from 'react-scene-graph'
const desktopBackground = Electron.remote.require('./utils/desktopBackground.js')

import * as ContentLoader from '../api/ContentLoader'
import * as URIUtils from '../utils/URIUtils'
import { storyboardActions, tabActions } from '../actions'
import { DeleteSceneButton, SceneHeader, NewSceneButton, QuickOpenCodeButton } from '../components/storyboard'

const stylesCreator = ({colors}) => {
  const {availWidth, availHeight} = window.screen
  const backgroundImageURL = desktopBackground.getBackgroundImage()

  return {
    container: {
      flex: '1 1 auto',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
    },
    storyboard: {
      flex: '1 1 auto',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
    },
    backdropContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      WebkitFilter: 'blur(20px) saturate(120%) brightness(50%)',
      backgroundImage: backgroundImageURL && `url(${backgroundImageURL})`,
      backgroundSize: `${availWidth}px ${availHeight}px`,
      transform: 'scale(1.1)',
    },
  }
}

const mapDispatchToProps = (dispatch) => ({
  storyboardActions: bindActionCreators(storyboardActions, dispatch),
  tabActions: bindActionCreators(tabActions, dispatch),
})

const mapStateToProps = (state) => createSelector(
  (state) => ({})
)

@StylesEnhancer(stylesCreator)
class Storyboard extends Component {

  constructor(props) {
    super()

    const {width, height} = props

    this.state = {
      viewport: ViewportUtils.init({width, height}),
    }
  }

  componentWillReceiveProps(nextProps) {
    const {width: oldWidth, height: oldHeight} = this.props
    const {width: newWidth, height: newHeight} = nextProps
    const {viewport} = this.state

    if (newWidth !== oldWidth || newHeight !== oldHeight) {
      const dimensions = {width: newWidth, height: newHeight}

      this.setState({
        viewport: ViewportUtils.resize(viewport, dimensions),
      })
    }
  }

  componentWillMount() {
    const { fileId, storyboardActions } = this.props
    storyboardActions.openStoryboard(fileId)
  }

  onViewportChange = (viewport) => {
    this.setState({viewport})
  }

  createScene = () => this.props.storyboardActions.createScene(this.props.fileId)

  openSceneInTab = (filePath) => this.props.tabActions.splitRight(CONTENT_PANES.CENTER, URIUtils.filePathToURI(filePath))

  deleteScene = (sceneId) => this.props.storyboardActions.deleteScene(this.props.fileId, sceneId)

  updateEntryScene = (sceneId) => this.props.storyboardActions.updateEntryScene(this.props.fileId, sceneId)

  renderHeader = (id, headerProps) => {
    return (
      <div onClick={() => this.updateEntryScene(id)}>
        <DeleteSceneButton onClick={() => this.deleteScene(id)} />
        <QuickOpenCodeButton onClick={() => this.openSceneInTab(headerProps.filePath)}/>
        <SceneHeader {...headerProps} />
      </div>
    )
  }

  render() {
    const {
      fileId,
      storyboardActions,
      styles,
      storyboard,
      yopsStyle,
    } = this.props
    const {viewport} = this.state
    const syncServiceAddress = 'http://localhost:4082'
    const onLayoutUpdate = () => {}

    return (
      <div style={styles.container}>
        <div style={styles.backdropContainer}>
          <div style={styles.backdrop} />
        </div>
        <NewSceneButton onClick={this.createScene} />
        <YOPS
          style={styles.storyboard}
          onDeleteScene={this.deleteScene}
          onClickScene={this.updateEntryScene}
          syncServiceAddress={syncServiceAddress}
          onLayoutUpdate={onLayoutUpdate}
          onViewportChange={this.onViewportChange}
          renderHeader={this.renderHeader}
          viewport={viewport}
        />
      </div>
    )
  }
}

const ConnectedClass = connect(mapStateToProps, mapDispatchToProps)(Storyboard)

export default ConnectedClass

export const registerLoader = () => {
  const loaderId = 'com.decosoftware.storyboard'

  const loaderFilter = (uri, state) => {
    return (
      (uri.startsWith('file://') && uri.endsWith('.storyboard.js')) ||
      URIUtils.getParam(uri, 'loader') === loaderId
    )
  }

  ContentLoader.registerLoader({
    name: 'Storyboard',
    id: loaderId,
    filter: loaderFilter,
    renderContent: ({uri, width, height}) => (
      <ConnectedClass
        fileId={URIUtils.withoutProtocolOrParams(uri)}
        width={width}
        height={height}
      />
    ),
  })
}

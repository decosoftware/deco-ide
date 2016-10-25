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
import YOPS, { storyboardActions as extStoryboardActions, storyboardStore } from 'yops'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import path from 'path'
const desktopBackground = Electron.remote.require('./utils/desktopBackground.js')
import { HotKeys } from 'react-hotkeys'

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
      outline: 'none',
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
  keyMap = {
    resetScale: 'command+0',
    resetScaleAndCenter: 'command+1',
    resetScaleAndCenterActive: 'command+2',
  }
  keyHandlers = {
    resetScale: (e) => {
      const {viewport,activeScene} = storyboardStore.getStoryboardState()
      extStoryboardActions.setViewportScale(1)
    },
    resetScaleAndCenter: (e) => {
      extStoryboardActions.setViewportScale(1)
      extStoryboardActions.centerViewport()
    },
    resetScaleAndCenterActive: (e) => {
      const {viewport,activeScene} = storyboardStore.getStoryboardState()
      extStoryboardActions.setViewportScale(1)
      extStoryboardActions.centerSceneInViewport(activeScene)
    },
  }

  constructor(props) {
    super()
    const {width, height} = props
    extStoryboardActions.initializeViewportWithSize({width, height})
  }

  componentWillReceiveProps(nextProps) {
    const {width: oldWidth, height: oldHeight} = this.props
    const {width: newWidth, height: newHeight} = nextProps
    const {viewport} = storyboardStore.getStoryboardState()

    if (newWidth !== oldWidth || newHeight !== oldHeight) {
      const dimensions = {width: newWidth, height: newHeight}

      extStoryboardActions.resizeViewport(dimensions)
    }
  }

  componentWillMount() {
    const { fileId, storyboardActions } = this.props
    storyboardActions.openStoryboard(fileId)
  }

  convertYopsElementIdToDecoElementPath = (elementId) => {
    const split = elementId.split('.')
    const pathElements = split.slice(1, split.length - 1)
    return '.' + pathElements.join('.')
  }

  getScene = (id) => {
    const {scenes} = storyboardStore.getStoryboardState()
    return scenes.find(scene => scene.id == id)
  }

  createScene = () => this.props.storyboardActions.createScene(this.props.fileId)

  openSceneInTab = (filePath) => this.props.tabActions.addTabToFocusedGroup(CONTENT_PANES.CENTER, URIUtils.filePathToURI(filePath))

  deleteScene = (sceneId) => this.props.storyboardActions.deleteScene(this.props.fileId, sceneId)

  updateEntryScene = (sceneId) => this.props.storyboardActions.updateEntryScene(this.props.fileId, sceneId)

  selectElement = (element) => {
    const { activeScene } = storyboardStore.getStoryboardState()
    if (!activeScene) return
    const { id } = element
    const pathToElement = this.convertYopsElementIdToDecoElementPath(id)
    this.props.storyboardActions.selectElement(activeScene, pathToElement)
  }

  renderHeader = (headerProps) => {
    const {id} = headerProps
    return (
      <div onClick={() => this.updateEntryScene(id)}>
        <DeleteSceneButton onClick={() => this.deleteScene(id)} />
        <QuickOpenCodeButton onClick={() => {
          const scene = this.getScene(id)
          if (scene) {
            extStoryboardActions.centerSceneInViewport(id)
            this.openSceneInTab(scene.filePath)
          }
        }}/>
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
    const syncServiceAddress = 'http://localhost:4082'
    const onLayoutUpdate = () => {}

    return (
      <HotKeys
        handlers={this.keyHandlers}
        keyMap={this.keyMap}
        style={styles.container}
      >
      <div style={styles.container}>
        <div style={styles.backdropContainer}>
          <div style={styles.backdrop} />
        </div>
        <NewSceneButton onClick={this.createScene} />
        <YOPS
          style={styles.storyboard}
          onDeleteScene={this.deleteScene}
          onClickScene={this.updateEntryScene}
          onClickElement={this.selectElement}
          syncServiceAddress={syncServiceAddress}
          onLayoutUpdate={onLayoutUpdate}
          renderHeader={this.renderHeader}
        />
      </div>
      </HotKeys>
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

import React, { Component, PropTypes, } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import YOPS from 'yops'

import * as ContentLoader from '../api/ContentLoader'
import * as URIUtils from '../utils/URIUtils'
import { storyboardActions } from '../actions'

const stylesCreator = (theme) => {
  const {colors} = theme
  return {
    container: {
      backgroundColor: 'white',
      flex: '1 1 auto',
    }
  }
}

const mapDispatchToProps = (dispatch) => ({
  storyboardActions: bindActionCreators(storyboardActions, dispatch),
})

const mapStateToProps = (state) => createSelector(
  (state) => state.storyboard,
  (storyboard) => ({
    storyboard: storyboard,
    connections: storyboard.connections,
    scenes: storyboard.scenes,
  })
)

let newSceneCounter = 1

class NewSceneButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const style = {
      position: 'absolute',
      background: 'black',
      width: '30px',
      height: '30px',
      borderRadius: '25%',
      top: '20px',
      right: '20px',
      zIndex: 1,
      textAlign: 'center',
      paddingTop: '3px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
    }

    return (
      <div style={style} onClick={this.props.onClick}>
        +
      </div>
    )
  }
}

@StylesEnhancer(stylesCreator)
class Storyboard extends Component {

  componentWillMount() {
    const { fileId, storyboardActions } = this.props
    storyboardActions.openStoryboard(fileId)
  }

  render() {
    const {
      connections,
      scenes,
      storyboardActions,
      styles,
      storyboard,
      yopsStyle
    } = this.props
    const syncServiceAddress = 'http://localhost:4082'
    const onLayoutUpdate = () => {}

    return (
      <div style={styles.container}>
        <NewSceneButton onClick={storyboardActions.addScene}/>
        <YOPS
          style={yopsStyle}
          connections={connections}
          scenes={scenes}
          onDeleteScene={storyboardActions.deleteScene}
          syncServiceAddress={syncServiceAddress}
          onLayoutUpdate={onLayoutUpdate}
        />
      </div>
    )
  }
}

const ConnectedClass = connect(mapStateToProps, mapDispatchToProps)(Storyboard)

export default ConnectedClass

export const registerLoader = () => {
  ContentLoader.registerLoader({
    name: 'Storyboard',
    id: 'com.decosoftware.storyboard',
    filter: (uri) => uri && uri.startsWith('file://') && uri.endsWith('.storyboard.js'),
    renderContent: (uri) => (
      <ConnectedClass
        fileId={uri && URIUtils.withoutProtocol(uri)}
      />
    ),
  })
}

import React, { Component, PropTypes, } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import YOPS from 'yops'

import { storyboardActions } from '../actions'

const stylesCreator = (theme) => {
  const {colors} = theme
  return {
    container: {
      // backgroundColor: colors.editor.background,
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

export default connect(mapStateToProps, mapDispatchToProps)(Storyboard)

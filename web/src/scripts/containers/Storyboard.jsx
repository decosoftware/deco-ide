import React, { Component, PropTypes, } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import YOPS from 'yops'

const stylesCreator = (theme) => {
  const {colors} = theme
  return {}
}

const mapDispatchToProps = (dispatch) => ({

})

const mapStateToProps = (state) => createSelector(

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

class Storyboard extends Component {
  state = {
    scenes: {
      'Fun': {id: 'Fun', name: 'FunName'},
      // 'Bun': {id: 'Bun', name: 'BunName'},
      // 'Sun': {id: 'Sun', name: 'SunName'},
    }
  }

  createScene = () => {
    const id = `NewScene${newSceneCounter}`
    const name = `New Scene ${newSceneCounter}`
    newSceneCounter++
    const newScenes = {
      ...this.state.scenes,
      [id]: { id, name }
    }
    this.setState({scenes: newScenes})
  }

  handleDeleteScene = (id) => {
    this.setState({
      scenes: _.omit(this.state.scenes, id)
    })
  }

  render() {
    const { styles, yopsStyle } = this.props
    const connections = {}
    const syncServiceAddress = 'http://localhost:4082'
    const onLayoutUpdate = () => {}

    return (
      <div>
        <NewSceneButton onClick={this.createScene}/>
        <YOPS
          style={yopsStyle}
          connections={connections}
          scenes={this.state.scenes}
          onDeleteScene={this.handleDeleteScene}
          syncServiceAddress={syncServiceAddress}
          onLayoutUpdate={onLayoutUpdate}
        />
      </div>
    )
  }
}

export default Storyboard
// export default connect(mapStateToProps, mapDispatchToProps)(
//   StylesEnhancer(stylesCreator)(Storyboard),
// )

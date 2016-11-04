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
import ReactDOM from 'react-dom'
import React, { Component } from 'react'
import { StylesProvider, StylesEnhancer } from 'react-styles-provider'

import * as ImageCaptureUtils from '../../utils/ImageCaptureUtils'

const stylesCreator = ({colors}, {type}) => {
  const caretColor = type === 'platform' ? 'rgb(252,251,252)' : colors.menu.backdrop

  return {
    caret: {
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: '0 10px 10px 10px',
      borderColor: `transparent transparent ${caretColor} transparent`,
      position: 'absolute',
      top: '-9px',
      zIndex: "10001",
      'WebkitFilter': 'drop-shadow(0px -2px 1px rgba(0,0,0,0.15))',
    },
    solidBackground: {
      position: 'absolute',
      overflow: 'hidden',
      border: `1px solid ${colors.dividerInverted}`,
      boxShadow: '0 0 45px rgba(0,0,0,0.3)',
      borderRadius: 4,
      WebkitFilter: 'saturate(220%)',
      zIndex: -1,
    },
    imageBackgroundContainer: {
      position: 'absolute',
      overflow: 'hidden',
      borderRadius: 4,
      zIndex: -1,
    },
    imageBackground: {
      position: 'absolute',
      backgroundSize: '100%',
      WebkitFilter: 'blur(10px) saturate(220%) opacity(40%)',
      transform: 'scale(1.1)',
    },
    backdrop: {
      backgroundColor: colors.menu.backdrop,
    },
    backdropSaturated: {
      backgroundColor: colors.menu.backdropSaturated,
    },
  }
}

@StylesEnhancer(stylesCreator, ({type}) => ({type}))
class MenuInner extends Component {

  static defaultProps = {
    className: '',
    style: {},
  }

  state = {}

  captureBackground(rect) {
    const {width, height} = rect

    if (width === 0 || height === 0) return

    ImageCaptureUtils.captureCurrentPage(rect)
      .then((dataURL) => {
        if (this.unmounting) return

        this.setState({background: dataURL})
      })
      .catch(() => {
        console.log('Failed to capture image of webContents')
      })
  }

  onResize() {
    const {captureBackground} = this.props

    if (!this.refs.content) return

    const rect = ReactDOM.findDOMNode(this.refs.content).getBoundingClientRect()
    const old = this.state.rect || {}

    if (rect.top !== old.top || rect.left !== old.left ||
        rect.width !== old.width || rect.height !== old.height) {
      this.props.onResize(rect)

      if (captureBackground) {
        this.setState({rect})
        this.captureBackground(rect)
      }
    }
  }

  componentDidMount() {
    this.onResize()
  }

  componentDidUpdate() {
    this.onResize()
  }

  componentWillUnmount() {
    this.unmounting = true
  }

  renderCaret() {
    const {styles, caret, caretPosition} = this.props

    if (!caret) return null

    const caretStyle = {
      ...styles.caret,
      left: caretPosition.x - 10,
    }

    return (
      <div style={caretStyle} />
    )
  }

  renderBlurredBackground() {
    const {styles} = this.props
    const {background, rect} = this.state

    const elements = []

    if (rect) {
      const solidBackgroundStyle = {
        ...styles.solidBackground,
        width: rect.width,
        height: rect.height,
        ...(styles.backdrop),
      }

      elements.push(
        <div key={'solid-background'} style={solidBackgroundStyle} />
      )
    }

    if (background) {
      const imageBackgroundContainerStyle = {
        ...styles.imageBackgroundContainer,
        width: rect.width,
        height: rect.height,
      }

      const imageBackgroundStyle = {
        ...styles.imageBackground,
        width: rect.width,
        height: rect.height,
        backgroundImage: `url(${background})`,
      }

      elements.push(
        <div key={'image-background'} style={imageBackgroundContainerStyle}>
          <div style={imageBackgroundStyle} />
        </div>
      )
    }

    return elements
  }

  render() {
    const {styles, captureBackground, style, className, onClick, hideMenu, theme} = this.props

    const children = React.cloneElement(this.props.children, {
      ref: 'content',
      hideMenu: this.props.hideMenu,
    })

    return (
      <div
        key='root'
        className={className}
        style={style}
        onClick={onClick}
      >
        {captureBackground && this.renderBlurredBackground(styles)}
        {children}
        {this.renderCaret()}
      </div>
    )
  }
}

class Menu extends Component {

  static contextTypes = {
    theme: React.PropTypes.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      show: props.show,
      caretPosition: {
        x: 0,
        y: 0,
      },
      innerContentSize: {
        width: 0,
        height: 0,
      },
    }
    const _onMouseDown = this._dismissOnMouseDown.bind(this)
    this._attachGlobalListeners = () => {
      document.addEventListener('mousedown', _onMouseDown)
    }
    this._detachGlobalListeners = () => {
      document.removeEventListener('mousedown', _onMouseDown)
    }
  }

  // Public API

  hide() {
    this.props.requestClose()
  }

  // Event Handling

  _dismissOnMouseDown(e) {
    if (!this._element.contains(e.target)) {
      this.hide()
    }
  }

  _dismissOnClickChildren() {
    if (this.props.hideOnClick) {
      this.hide()
    }
  }

  _calculatePositions() {
    const caretOffset = this.props.caret ? 10 : 0
    let tooCloseToEdge = false

    const anchorPosition = this.props.anchorPosition
    const containerRect = {
      width: window.innerWidth,
      height: window.innerHeight,
      right: window.innerWidth,
      bottom: window.innerHeight,
      top: 0,
      left: 0,
    }

    const {width: innerWidth, height: innerHeight} = this.state.innerContentSize

    const position = {}
    position.y = anchorPosition.y + caretOffset

    if (this.props.positionX === 'center') {
      position.x = anchorPosition.x - innerWidth / 2
    } else {
      position.x = Math.min(anchorPosition.x, containerRect.right - innerWidth - 10)
    }
    if (position.x + innerWidth > containerRect.width - 10) {
      position.x = containerRect.width - innerWidth - 10
      tooCloseToEdge = true
    }
    if (position.y + innerHeight > containerRect.height - 10) {
      position.y = containerRect.height - innerHeight - 10
      tooCloseToEdge = true
    }

    const caretPosition = {
      x: ((anchorPosition.x - position.x) + this.props.caretOffset.x) || 0,
      y: 0,
    }
    if (tooCloseToEdge) {
      caretPosition.x = containerRect.width + 100
    }

    return {position, caretPosition}
  }

  _updateMenuPosition() {
    const {position, caretPosition} = this._calculatePositions()
    _.extend(this._element.style, {
      position: 'absolute',
      top: `${position.y}px`,
      left: `${position.x}px`,
      zIndex: '10000',
    })
    if (! _.isEqual(this.state.caretPosition, caretPosition)) {
      this.setState({caretPosition})
    }
  }

  // Menu Rendering

  _createMenu() {
    this._element = document.createElement('div')
    this._element.id = _.uniqueId('node')
    document.body.appendChild(this._element)
    this._attachGlobalListeners()
    this._updateMenu()
  }

  _updateMenu() {
    this._updateMenuPosition()
    this._renderReactSubTree(this._element)
  }
  _destroyMenu() {
    ReactDOM.unmountComponentAtNode(this._element)
    document.body.removeChild(this._element)
    delete this._element
    this._detachGlobalListeners()
  }

  _renderReactSubTree(element) {

    // Propagate theme into subtree
    const menuInner = (
      <StylesProvider theme={this.context.theme}>
        <MenuInner
          children={this.props.children}
          className={this.props.className}
          style={this.props.style}
          caret={this.props.caret}
          type={this.props.type}
          caretPosition={this.state.caretPosition}
          onResize={this._onInnerContentResize.bind(this)}
          onClick={this._dismissOnClickChildren.bind(this)}
          hideMenu={this._dismissOnClickChildren.bind(this)}
          transitionName={this.props.transitionName}
          captureBackground={this.props.captureBackground}
        />
      </StylesProvider>
    )

    ReactDOM.render(menuInner, element)
  }
  _onInnerContentResize(rect) {
    const innerContentSize = {
      width: rect.width,
      height: rect.height,
    }
    if (!_.isEqual(this.state.innerContentSize, innerContentSize)) {
      this.setState({
        innerContentSize
      })
    }
  }

  // LifeCycle
  componentWillReceiveProps(nextProps) {
    this.setState({
      show: nextProps.show,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.show) {
      if (prevState.show) {
        this._updateMenu()
      } else {
        this._createMenu()
      }
    } else {
      if (prevState.show) {
        this._destroyMenu()
      }
    }
  }
  componentWillUnmount() {
    if (this.state.show) {
      this._destroyMenu()
    }
  }

  render() {
    return null
  }
}

Menu.defaultProps = {
  requestClose: () => {},
  className: '',
  style: {},
  show: false,
  caret: false,
  anchorPosition: {x: 0, y: 0},
  caretOffset: {x: 0, y: 0},
  captureBackground: false,
  type: 'regular',
}

export default Menu

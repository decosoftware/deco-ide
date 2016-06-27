import React, { Component } from 'react'

const toggleStyle = {
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'row',
  overflow: 'hidden',
  cursor: 'default',
}

const toggleButtonStyle = {
  height: 21,
  lineHeight: '21px',
  fontSize: 12,
  color: 'black',
  background: 'white',
  textAlign: 'center',
  borderWidth: 1,
  borderColor: 'rgba(0,0,0,0.1)',
  borderStyle: 'solid',
}

const toggleButtonActiveStyle = {
  ...toggleButtonStyle,
  color: 'white',
  background: 'linear-gradient(rgb(105, 177, 250), rgb(13, 129, 255))',
}

class ToggleTab extends Component {
  render() {
    const { options, active, onClick = () => {}, buttonWidth = 70 } = this.props

    return (
      <div style={toggleStyle}>
        {_.map(options, (option, i) => {
          const style = {
            ...(active === option ? toggleButtonActiveStyle : toggleButtonStyle),
            borderLeftWidth: i === options.length - 1 ? 0 : 1,
            width: buttonWidth,
          }

          return (
            <div style={style} key={i} onClick={(evt) => {
                evt.stopPropagation()
                onClick(option)
              }}>
              {option}
            </div>
          )
        })}
      </div>
    )
  }
}

export default ToggleTab

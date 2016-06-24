import React, { Component } from 'react'

import NoContent from '../display/NoContent'
import Icon from '../display/Icon'
import TwoColumnMenu from './TwoColumnMenu'
import ToggleTab from '../buttons/ToggleTab'

import _ from 'lodash'

const emptySimulatorMenuStyle = {
  width: 300,
  height: 280,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: '15px 10px 0px 10px',
}

const mapSimulatorListToMenuOptions = (options, platform, onClick) => {
  return _.map(options, (simInfo) => {
    return {
      text: simInfo.name,
      action: () => {
        onClick(simInfo, platform)
      }
    }
  })
}

const renderError = (messageList) => {
  const children = []
  _.forEach(messageList, (message) => {
    children.push(message)
    children.push(<br />)
    children.push(<br />)
  })

  return (
    <div
      className={'helvetica-smooth'}
      style={emptySimulatorMenuStyle}>
      <NoContent>
        {children}
      </NoContent>
    </div>
  )
}

const IOSMenu = ({ display, onClick }) => {
  if (display.error) {
    return renderError(display.message)
  }
  const options = mapSimulatorListToMenuOptions(display.simList, 'ios', onClick)
  if (options.length > 0) {
    const iphones = options.splice(0, Math.ceil(options.length / 2))
    const ipads = options

    return (
      <TwoColumnMenu
        column1={iphones}
        column2={ipads}
      />
    )
  }

  return renderError([
    'No simulators available.',
    'Please install Xcode and an iOS simulator to preview your project.'
  ])
}

const AndroidMenu = ({ display, onClick, onToggleEmulationOption, activeEmulationOption }) => {
  if (display.error) {
    return renderError(display.message)
  }
  const options = mapSimulatorListToMenuOptions(display.simList, 'android', onClick)
  if (options.length > 0) {
    const androidCol1 = options.splice(0, Math.ceil(options.length / 2))
    const androidCol2 = options

    return (
      <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <ToggleTab
          buttonWidth={90}
          onClick={onToggleEmulationOption}
          options={['AVD', 'Genymotion']}
          active={activeEmulationOption} />
        <div style={{marginTop: 10}} />
        <TwoColumnMenu
          column1={androidCol1}
          column2={androidCol2}
        />
      </div>
    )
  }

  return renderError([
    'No simulators available.',
    'Please install Android Studio and set your path to the Android SDK in preferences (cmd + ,)'
  ])
}

class SimulatorMenu extends Component {
  componentDidMount() {
    //on mount we update the list
    this.props.checkAvailableSims()
  }
  render() {
    const { ios, android, onClick, active = 'iOS', setActiveList, setAndroidEmulationOption, activeEmulationOption } = this.props
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <ToggleTab
          onClick={setActiveList}
          options={['iOS', 'Android']}
          active={active}
        />
        <div style={{marginTop: 10}} />
        {active === 'iOS' ? (
          <IOSMenu display={ios} onClick={onClick} />
        ) : (
          <AndroidMenu display={android}
            onClick={onClick}
            activeEmulationOption={activeEmulationOption}
            onToggleEmulationOption={setAndroidEmulationOption} />
        )}
      </div>
    )
  }
}

export default SimulatorMenu

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

import React, { PropTypes, } from 'react'

const style = {
  width: 35,
  height: 20,
  flex: '0 0 auto',
}

class NavigatorHeaderButton extends React.Component {
  render() {
    const { buttonClass, onClick } = this.props
    return (
      <div
        className={buttonClass}
        style={style}
        onClick={onClick}
      />
    )
  }
}

NavigatorHeaderButton.propTypes = {
  buttonClass: PropTypes.string.isRequired,
}

export default NavigatorHeaderButton

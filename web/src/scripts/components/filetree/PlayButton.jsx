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

import NavigatorHeaderButton from './NavigatorHeaderButton'
import TwoStateButton from '../buttons/TwoStateButton'

export default ({
  node, onChange, active
}) => {
  return (
    <TwoStateButton
      enabled={active}
      onChange={onChange}
      hoverStyle={{ opacity: 0.75 }}
      enabledStyle={{ opacity: 0.5 }}>
      <div>
        <NavigatorHeaderButton
          buttonClass={'icon-play'}
        />
      </div>
    </TwoStateButton>
  )
}

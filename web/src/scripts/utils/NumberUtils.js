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

export const getNearestValue = (val, low, high) => {
  return Math.abs(val - low) < Math.abs(val - high) ? low : high
}

export const getDecimalCount = (num) => {
  const decSplitArr = num.toString().split('.')
  return decSplitArr[1] ? decSplitArr[1].length : 0
}

export const conditionalClamp = (val, min, max) => {
  if (min && val <= min) {
    return min
  }
  if (max && val >= max) {
    return max
  }
  return val
}

export const getLockedValue = (val, min, max, step) => {
  const stepCount = val / step
  // If step=.1, value=.82, this gets us .8
  const newValue = getNearestValue(stepCount, Math.floor(stepCount), Math.ceil(stepCount)) * step
  // Clip value to step's decimals, and then remove trailing 0s
  return Number(conditionalClamp(newValue, min, max).toFixed(getDecimalCount(step)))
}

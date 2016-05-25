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

import path from 'path'
import { nativeImage, } from 'electron'

const DecoIcon = nativeImage.createFromPath(path.join(__dirname, '../../public/images/deco-icon.png'))

export const INFO = {
  noUpdateIsAvailable: {
    type: 'info',
    message: 'No update is available',
    detail: 'You are using the latest version of Deco',
    buttons: ['Ok', ],
    icon: DecoIcon,
  },
}

export const QUESTION = {
  shouldRestartAndUpdate: {
    type: 'question',
    message: 'A new version of Deco is available!',
    detail: 'Update and restart Deco? Any unsaved changes will be lost.',
    buttons: ['Update and Restart', 'Later', ],
    icon: DecoIcon,
  },
  shouldLoseTemporaryDirectory: {
    type: 'question',
    message: 'Quit without saving?',
    detail: 'This project has not yet been saved. ' +
        'New projects are temporary until saved for the first time. ' +
        'To save this project, first click Cancel, then go to File > Save Project.',
    buttons: ['Quit', 'Cancel',],
    icon: DecoIcon,
  },
  shouldLoseUnsavedProgress: {
    type: 'question',
    message: 'Quit without saving?',
    detail: 'Files have been changed since last save. Quit anyway?',
    buttons: ['Quit', 'Cancel',],
    icon: DecoIcon,
  },
}

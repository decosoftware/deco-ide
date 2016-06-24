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

const ipc = Electron.ipcRenderer

const requestMap = {}

let messageId = 1
const generateMessageId = (channel) => channel + messageId++

const _request = (channel, body, fromPreferences) => {
  if (typeof channel !== 'string' || channel.length === 0) {
    throw new Error(`Invalid message channel: ${channel}`)
  }

  const messageId = generateMessageId(channel)
  console.log('registering ' + messageId)

  ipc.send('request', messageId, channel, body, fromPreferences)

  return new Promise((resolve, reject) => {
    requestMap[messageId] = (err, data) => {
      console.log(messageId + ' => ' + (err ? 'rejected' : 'resolved'))
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    }
  })
}

ipc.on('response', (evt, messageId, err, data) => {
  if (! requestMap[messageId]) {
    throw new Error(`No registered request was available for the response with id: ${messageId}`)
  }

  const handler = requestMap[messageId]
  delete requestMap[messageId]
  handler(err, data)
})

const request = (req, fromPreferences) => {
  return _request(req.type, req, fromPreferences)
}

export default request

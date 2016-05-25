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

export const CREATE_HISTORY = 'CREATE_HISTORY'
export const createHistory = (id) => {
  return {
    type: CREATE_HISTORY,
    payload: {
      id,
    },
  }
}

export const ADD_TO_HISTORY = 'ADD_TO_HISTORY'
export const addToHistory = (id, decoChange) => {
  return {
    type: ADD_TO_HISTORY,
    payload: {
      id,
      decoChange,
    }
  }
}

export const UNDO_FROM_HISTORY = 'UNDO_FROM_HISTORY'
export const undoFromHistory = (id) => {
  return {
    type: UNDO_FROM_HISTORY,
    payload: {
      id,
    },
  }
}

export const REDO_TO_HISTORY = 'REDO_TO_HISTORY'
export const redoToHistory = (id) => {
  return {
    type: REDO_TO_HISTORY,
    payload: {
      id,
    },
  }
}

export const HISTORY_ID_CHANGE = 'HISTORY_ID_CHANGE'
export const historyIdChange = (oldId, newId) => {
  return {
    type: HISTORY_ID_CHANGE,
    oldId,
    newId,
  }
}

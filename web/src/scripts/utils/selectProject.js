import * as editorActions from '../actions/editorActions'
import { routeActions, } from 'react-router-redux'
import { clearFileState } from '../actions/fileActions'
import { tabActions } from '../actions'

export default function openProject(payload, dispatch) {
  const rootPath = payload.absolutePath
  let query = {}
  if (payload.isTemp) {
    query.temp = true
  }
  dispatch(clearFileState())
  dispatch(editorActions.clearEditorState())
  dispatch(tabActions.closeAllTabs())
  dispatch(routeActions.push({
    pathname: `/workspace/${rootPath}`,
    query: query,
  }))
}

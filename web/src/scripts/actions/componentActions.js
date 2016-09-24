import DecoClient from '../clients/DecoClient'

export const at = {
  USER_COMPONENTS_FETCH_REQUEST_PENDING: 'USER_COMPONENTS_FETCH_REQUEST_PENDING',
  USER_COMPONENTS_FETCH_REQUEST_SUCCESS: 'USER_COMPONENTS_FETCH_REQUEST_SUCCESS',
  USER_COMPONENTS_FETCH_REQUEST_FAILURE: 'USER_COMPONENTS_FETCH_REQUEST_FAILURE',

  COMPONENTS_FETCH_REQUEST_PENDING: 'COMPONENTS_FETCH_REQUEST_PENDING',
  COMPONENTS_FETCH_REQUEST_SUCCESS: 'COMPONENTS_FETCH_REQUEST_SUCCESS',
  COMPONENTS_FETCH_REQUEST_FAILURE: 'COMPONENTS_FETCH_REQUEST_FAILURE',

  COMPONENT_CREATE_REQUEST_PENDING: 'COMPONENT_CREATE_REQUEST_PENDING',
  COMPONENT_CREATE_REQUEST_SUCCESS: 'COMPONENT_CREATE_REQUEST_SUCCESS',
  COMPONENT_CREATE_REQUEST_FAILURE: 'COMPONENT_CREATE_REQUEST_FAILURE',

  COMPONENT_UPDATE_REQUEST_PENDING: 'COMPONENT_UPDATE_REQUEST_PENDING',
  COMPONENT_UPDATE_REQUEST_SUCCESS: 'COMPONENT_UPDATE_REQUEST_SUCCESS',
  COMPONENT_UPDATE_REQUEST_FAILURE: 'COMPONENT_UPDATE_REQUEST_FAILURE',

  COMPONENT_DELETE_REQUEST_PENDING: 'COMPONENT_DELETE_REQUEST_PENDING',
  COMPONENT_DELETE_REQUEST_SUCCESS: 'COMPONENT_DELETE_REQUEST_SUCCESS',
  COMPONENT_DELETE_REQUEST_FAILURE: 'COMPONENT_DELETE_REQUEST_FAILURE',
}

export const fetchUserComponents = (id) => async (dispatch, getState) => {
  dispatch({type: at.USER_COMPONENTS_FETCH_REQUEST_PENDING})

  try {
    const {token} = getState().user
    const components = await DecoClient.getUserComponents(id, {access_token: token})
    dispatch({type: at.USER_COMPONENTS_FETCH_REQUEST_SUCCESS, payload: components})
    return components
  } catch (e) {
    dispatch({type: at.USER_COMPONENTS_FETCH_REQUEST_FAILURE})
    throw e
  }
}

export const fetchComponents = () => async (dispatch) => {
  dispatch({type: at.COMPONENTS_FETCH_REQUEST_PENDING})

  try {
    const components = await DecoClient.getComponents()
    dispatch({type: at.COMPONENTS_FETCH_REQUEST_SUCCESS, payload: components})
    return components
  } catch (e) {
    dispatch({type: at.COMPONENTS_FETCH_REQUEST_FAILURE})
    throw e
  }
}

export const createComponent = () => async (dispatch, getState) => {
  dispatch({type: at.COMPONENT_CREATE_REQUEST_PENDING})

  try {
    const {token} = getState().user
    const component = await DecoClient.createComponent(undefined, {access_token: token})
    dispatch({type: at.COMPONENT_CREATE_REQUEST_SUCCESS, payload: component})
    return component
  } catch (e) {
    dispatch({type: at.COMPONENT_CREATE_REQUEST_FAILURE})
    throw e
  }
}

export const updateComponent = (component) => async (dispatch) => {
  dispatch({type: at.COMPONENT_UPDATE_REQUEST_PENDING, payload: component})

  try {
    await DecoClient.updateComponent(component)
    dispatch({type: at.COMPONENT_UPDATE_REQUEST_SUCCESS, payload: component})
    return component
  } catch (e) {
    dispatch({type: at.COMPONENT_UPDATE_REQUEST_FAILURE})
    throw e
  }
}

export const deleteComponent = (component) => async (dispatch) => {
  dispatch({type: at.COMPONENT_DELETE_REQUEST_PENDING, payload: component})

  try {
    await DecoClient.deleteComponent(component)
    dispatch({type: at.COMPONENT_DELETE_REQUEST_SUCCESS, payload: component})
    return component
  } catch (e) {
    dispatch({type: at.COMPONENT_DELETE_REQUEST_FAILURE})
    throw e
  }
}

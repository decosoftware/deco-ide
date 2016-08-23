import memoize from 'fast-memoize'

const style = {
  flex: '0 0 30px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 13,
  color: 'rgb(63,63,63)',
  fontSize: 11,
  letterSpacing: 0.3,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}
const hoverStyle = {
  backgroundColor: 'white',
}

const selectedStyle = {
  backgroundColor: 'rgba(200,200,200,0.4)',
}

const unsavedStyle = {
  fontStyle: 'italic',
}
const styles = {
  treeContainer: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  autoSizerWrapper: {
    flex: '1 1 auto',
    minHeight: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  nodeContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    outline: 'none',
  },
  nodeContent: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 0,
    minWidth: 0,
    cursor: 'default',
  },
  nodeText: {
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  caret: {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'rgb(63,63,63)',
    fontSize: 10,
    fontFamily: 'sans-serif',
    marginRight: 6,
  }
}

export const getPaddedStyle = memoize((depth, selected, hover) => {
  return {
    paddingLeft: 5 + depth * 20,
    ...styles.nodeContent,
    backgroundColor: selected ? 'rgba(200,200,200,0.8)' :
        hover ? 'rgba(200,200,200,0.3)' : 'transparent',
    color: selected ? 'black' : 'rgb(63,63,63)',
  }
})

export default styles

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
    flexWrap: 'no-wrap',
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
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
    marginLeft: 6,
    cursor: 'default',
  },
  nodeText: {
    color: 'rgb(63,63,63)',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '40px',
    height: 40,
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
    paddingLeft: depth * 20,
    ...styles.nodeContent,
    backgroundColor: selected ? 'rgba(200,200,200,0.5)' :
        hover ? 'rgba(200,200,200,0.1)' : 'rgb(252,252,252)',
  }
})

export default styles

export const colors = {
  background: 'rgb(29,30,36)',
  editorBackground: 'rgb(35,36,46)',
  text: '#DDDDDD',
  textSubtle: '#999999',
  divider: 'rgb(50,50,50)',
  dividerSubtle: 'rgb(35,36,46)',
  dividerString: '#0b0b0b',
  fileTree: {
    icon: '#CCCCCC',
  },
  tabs: {
    background: 'rgb(29,30,36)',
    backgroundFocused: 'rgb(35,36,46)',
    highlight: '#D8D8D8',
  },
}

export const sizes = {}

export const fontFamily = {
  main: '"Helvetica Neue", Helvetica, Arial, sans-serif',
}

const smoothing = {
  WebkitFontSmoothing: 'antialiased',
  textRendering: 'optimizeLegibility',
}

export const fonts = {
  regular: {
    fontFamily: fontFamily.main,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: 0.3,
    color: colors.text,
    ...smoothing,
  },
  regularSubtle: {
    fontFamily: fontFamily.main,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: 0.3,
    color: colors.textSubtle,
    ...smoothing,
  }
}

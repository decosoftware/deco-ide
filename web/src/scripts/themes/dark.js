export const colors = {
  background: 'rgb(29,30,36)',
  editorBackground: 'rgb(35,36,46)',
  text: '#DDDDEC',
  textSubtle: '#9999A2',
  textVerySubtle: '#555560',
  divider: 'rgb(50,50,50)',
  dividerSubtle: 'rgb(35,36,46)',
  dividerInverted: '#0b0b0b',
  input: {
    background: 'rgb(35,36,46)',
  },
  tabs: {
    background: 'rgb(29,30,36)',
    backgroundFocused: 'rgb(35,36,46)',
    highlight: '#D8D8E3',
  },
  fileTree: {
    icon: '#CCCCDD',
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

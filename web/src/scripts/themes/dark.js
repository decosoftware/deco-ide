export const colors = {
  background: 'rgb(29,30,36)',
  editorBackground: 'rgb(35,36,46)',
  text: 'white',
  textSubtle: '#999999',
  dividerSubtle: 'rgb(35,36,46)',
  divider: 'rgb(50,50,50)',
}

export const sizes = {}

export const fontFamily = {
  main: "'Helvetica Neue', Helvetica, sans-serif",
}

const smoothing = {
  WebkitFontSmoothing: 'antialiased',
  textRendering: 'optimizeLegibility',
}

export const fonts = {
  regular: {
    fontFamily: fontFamily.main,
    fontSize: 12,
    letterSpacing: 0.3,
    color: colors.textSubtle,
    ...smoothing,
  }
}

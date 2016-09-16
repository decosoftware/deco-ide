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
    ...smoothing,
  },
  regularSubtle: {
    fontFamily: fontFamily.main,
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: 0.3,
    ...smoothing,
  }
}

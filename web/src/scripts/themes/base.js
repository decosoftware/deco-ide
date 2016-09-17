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
  },
}

export const input = {
  platform: {
    height: 20,
    lineHeight: "20px",
    fontSize: 11,
    padding: 6,
    border: '1px solid rgb(208,208,208)',
    borderRadius: 3,
  },
}

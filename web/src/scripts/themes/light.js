import {
  fonts as baseFonts,
  input as baseInput,
} from './base'

export const name = 'Light'
export const id = 'light'

export const colors = {
  background: 'rgb(252,251,252)',
  text: 'rgb(103,103,103)',
  textSubtle: '#777777',
  textVerySubtle: '#CCCCCC',
  divider: 'rgb(229,229,229)',
  dividerSubtle: 'rgb(234,234,234)',
  dividerInverted: 'rgb(224,224,224)',
  dividerVibrant: 'rgba(245,245,255,0.1)',
  editor: {
    background: 'rgb(35,36,46)',
    divider: 'rgb(29,30,36)',
  },
  input: {
    background: 'white',
  },
  tabs: {
    highlight: 'rgb(22,128,250)',
    background: 'rgb(29,30,36)',
  },
  fileTree: {
    icon: '#484848',
    background: 'transparent',
    backgroundHover: 'rgba(0,0,0,0.05)',
    backgroundSelected: 'rgba(0,0,0,0.1)',
    text: 'rgb(63,63,63)',
    textSelected: 'black',
  },
  console: {
    background: 'rgb(29,30,36)',
  },
  menu: {
    backdrop: 'rgb(241,240,254)',
  },
  colorInput: {
    background: 'white',
    shadow: 'rgba(0,0,0,0.3)',
    shadowInner: 'rgba(0,0,0,0.3)',
  },
}

export const fonts = {
  ...baseFonts,
  regular: {
    ...baseFonts.regular,
    color: colors.text,
  },
  regularSubtle: {
    ...baseFonts.regularSubtle,
    color: colors.textSubtle,
  },
  buttonSmall: {
    ...baseFonts.buttonSmall,
    color: colors.text,
  },
}

export const input = {
  ...baseInput,
  regular: {
    height: 20,
    lineHeight: "20px",
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...fonts.regular,
  },
}

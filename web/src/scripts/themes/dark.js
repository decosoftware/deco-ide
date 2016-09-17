import {
  fonts as baseFonts,
  input as baseInput,
} from './base'

export const name = 'Dark'
export const id = 'dark'

export const colors = {
  background: 'rgb(29,30,36)',
  text: '#DDDDEC',
  textSubtle: '#9999A2',
  textVerySubtle: '#555560',
  divider: 'rgb(50,50,60)',
  dividerSubtle: 'rgb(35,36,46)',
  dividerInverted: '#0b0b0b',
  dividerVibrant: 'rgba(245,245,255,0.1)',
  editor: {
    background: 'rgb(35,36,46)',
    divider: '#0b0b0b',
  },
  input: {
    background: 'rgb(35,36,46)',
  },
  tabs: {
    highlight: '#D8D8E3',
    background: 'rgb(29,30,36)',
  },
  fileTree: {
    icon: '#CCCCDD',
    background: 'transparent',
    backgroundHover: 'rgba(200,225,255,0.08)',
    backgroundSelected: 'rgba(200,225,255,0.16)',
    text: 'rgb(63,63,63)',
    textSelected: 'black',
  },
  console: {
    background: 'rgb(29,30,36)',
  },
  menu: {
    backdrop: 'rgb(41,40,54)',
    backdropSaturated: 'rgb(59,60,63)',
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
  }
}

export const input = {
  ...baseInput,
  regular: {
    height: 30,
    lineHeight: "30px",
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...fonts.regular,
  },
}

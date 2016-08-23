
export const createJSX = ({name: tagname, props = [], }) => {
  if (props.length === 0) {
    return `<${tagname} />`
  }

  const childrenProp = props.filter(child => child.name === 'children')[0]
  const normalProps = props.filter(child => child.name !== 'children')
  const openTagStart = `<${tagname}`
  const closeTag = `</${tagname}>`
  const childrenText = childrenProp && childrenProp.default ? childrenProp.default : ''

  if (normalProps.length > 0) {
    const propsText = normalProps.map(({name, default: defaultValue, }) => {
      return `  ${name}={${JSON.stringify(defaultValue)}}`
    }).join('\n')

    return '' +
`${openTagStart}
${propsText}
>
  ${childrenText}
${closeTag}`

  // Has only a children prop
  } else {
    return '' +
`${openTagStart}>
  ${childrenText}
${closeTag}`
  }
}

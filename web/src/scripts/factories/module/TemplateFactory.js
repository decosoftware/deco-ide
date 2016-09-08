const createValue = (type, value) => {
  if (type === 'object') {
    return '{\n' + value.map(subProp => {
      const {name: subName, type: subType, defaultValue: subValue} = subProp
      return `    ${subName}: ${createValue(subType, subValue)},\n`
    }).join('') + '  }'
  } else if (type === 'raw') {
    return value
  } else {
    return JSON.stringify(value)
  }
}

export const createJSX = ({tagName, props = [], }) => {
  if (props.length === 0) {
    return `<${tagName} />`
  }

  const childrenProp = props.filter(child => child.name === 'children')[0]
  const normalProps = props.filter(child => child.name !== 'children')
  const openTagStart = `<${tagName}`
  const closeTag = `</${tagName}>`
  const childrenText = childrenProp && childrenProp.defaultValue ? childrenProp.defaultValue : ''

  if (normalProps.length > 0) {
    const propsText = normalProps.map(({name, type, defaultValue}) => {
      return `  ${name}={${createValue(type, defaultValue)}}`
    }).join('\n')

    if (childrenProp) {
      return '' +
`${openTagStart}
${propsText}
>
  ${childrenText}
${closeTag}`
    } else {
      return '' +
`${openTagStart}
${propsText}
/>`
    }

  // Has only a children prop
  } else {
    return '' +
`${openTagStart}>
  ${childrenText}
${closeTag}`
  }
}

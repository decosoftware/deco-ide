const createValue = (type, value) => {
  if (type === 'object') {
    return '{\n' + value.map(subProp => {
      const {name: subName, type: subType, value: subValue} = subProp
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
  const childrenText = childrenProp && childrenProp.value ? childrenProp.value : ''

  if (normalProps.length > 0) {
    const propsText = normalProps.map(({name, type, value}) => {
      return `  ${name}={${createValue(type, value)}}`
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

export const renderStarMemberCode = (starMember) => {
  if (!starMember) {
    return ''
  }

  const {alias} = starMember

  if (alias) {
    return `* as ${alias}`
  } else {
    return '*'
  }
}

export const renderDefaultMemberCode = (defaultMember) => {
  if (!defaultMember || !defaultMember.alias) {
    return ''
  }

  return defaultMember.alias
}

export const renderMemberListCode = (members) => {
  if (members.length === 0) {
    return ''
  }

  const memberListCode = members
    .map(({name, alias}) => {
      if (alias) {
        return `${name} as ${alias}`
      } else {
        return name
      }
    })
    .join(', ')

  return `{ ${memberListCode} }`
}

export const renderImportsCode = (imports) => {
  const {name, members = []} = imports

  if (members.length === 0) {
    return `import '${name}'`
  }

  const starMember = members.find(x => x.name === '*')
  const defaultMember = members.find(x => x.name === 'default')
  const regularMembers = members.filter(x => x.name !== '*' && x.name !== 'default')

  const starCode = renderStarMemberCode(starMember)
  const defaultCode = renderDefaultMemberCode(defaultMember)
  const memberListCode = renderMemberListCode(regularMembers)

  const allImportsCode = [defaultCode, starCode, memberListCode]
    .filter(x => x) // Filter out empty strings
    .join(', ')

  return `import ${allImportsCode} from '${name}'`
}

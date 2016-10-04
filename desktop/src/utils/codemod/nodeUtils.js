import j from 'jscodeshift'

export const createArgumentNodes = (args = []) => args.map((arg) => {
  switch (arg.type) {
    case 'Identifier': {
      return j.identifier(arg.value)
    }
    case 'MemberExpression': {
      return j.memberExpression(
        j.identifier(arg.object),
        j.identifier(arg.property)
      )
    }
    default: {
      return j.literal(arg.value || "")
    }
  }
})

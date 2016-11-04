import j from 'jscodeshift'
import _ from 'lodash'

export const findCommentMarker = (nodes, matchString) => {
  let match = -1
  _.each(nodes, (node, i) => {
    if(node.comments &&
       node.comments.length != 0 &&
       node.comments[0].value.indexOf(matchString) != -1) {
      match = i
    }
  })
  return match
}

export const addCommentsToNodeIndex = (nodes, index, comments) => {
  if (index >= 0 && comments.length > 0) {
    if (nodes.length <= index) {
      index = nodes.length - 1
    }
    const prevComments = nodes[index].comments
    nodes[index].comments = prevComments ? (
      prevComments.concat(comments)
    ) : (
      comments
    )
  }
}

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
    case 'CallExpression': {
      return createCallExpression(...arg.expression)
    }

    default: {
      return j.literal(arg.value || "")
    }
  }
})

export const createCallExpression = (object, property, args) => (
  j.callExpression(j.memberExpression(
    j.identifier(object), j.identifier(property)
  ), createArgumentNodes(args))
)

export const createExpressionStatement = (object, property, args) => (
  j.expressionStatement(createCallExpression(object, property, args))
)

export const inverseCreateArgumentNodes = (args = []) => args.map((arg) => {
  switch (arg.type) {
    case 'MemberExpression': {
      return {
        type: arg.type,
        object: arg.object.name,
        property: arg.property.name,
      }
    }
    case 'Identifier': {
      return {
        type: arg.type,
        value: arg.name,
      }
    }
    case 'Literal': {
      return {
        type: arg.type,
        value: arg.value,
      }
    }
    default: {
      return {}
    }
  }
})

export const addNodeAtIndex = (nodes, node, i) => {
  // -1 we append to the end
  if (i == -1) {
    i = nodes.length
  }

  //if we're potentially replacing a node then we transfer the leading comment
  if (nodes.length != 0 && i != nodes.length) {
    const comment = nodes[i].comments && nodes[i].comments[0]
    if (comment) {
      nodes[i].comments = nodes[i].comments.slice(1)
      node.comments = node.comments ? (
        node.comments.unshift(comment)
      ) : (
        [comment]
      )
    }
  }

  nodes.splice(i, 0, node)
}

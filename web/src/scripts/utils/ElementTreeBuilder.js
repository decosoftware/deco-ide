/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import _ from 'lodash'

import N from './simpleCodeMirrorPosition'
import Pos from '../models/editor/CodeMirrorPos'
import ASTUtils from './ASTUtils'
import { insertInTree } from './ElementTreeUtils'

export default class {

  // CodeMirror lines are 0-offset, vs. AST's 1-offset
  static convertLoc({line, column}) {
    return {line: line - 1, ch: column}
  }

  static getPrimitiveTypeFromNode(node) {
    const {type, value} = node

    if (type === 'Literal') {
      return typeof value
    }

    return null
  }

  static buildTagName(node) {
    switch (node.type) {
      case 'JSXIdentifier':
        return node.name
      break
      case 'JSXMemberExpression':
        const {object: {name: objectName}, property} = node
        return `${objectName}.${this.buildTagName(property)}`
      break
    }
  }

  static buildFakeRootElement() {
    return {
      start: 0,
      end: Infinity,
      children: [],
      openStart: {ch: 0, line: 0},
      openEnd: {ch: 0, line: 0},
      closeStart: {ch: Infinity, line: Infinity},
      closeEnd: {ch: Infinity, line: Infinity},
    }
  }

  static buildJSXElement(node) {
    const {openingElement, closingElement, loc: {start, end}} = node
    const {selfClosing, loc: {start: openStart, end: openEnd}} = openingElement

    return {
      name: this.buildTagName(openingElement.name),
      start: this.convertLoc(start),
      end: this.convertLoc(end),
      openStart: this.convertLoc(openStart),
      openEnd: this.convertLoc(openEnd),
      closeStart: closingElement && this.convertLoc(closingElement.loc.start),
      closeEnd: closingElement && this.convertLoc(closingElement.loc.end),
      selfClosing,
      children: [],
      props: [],
    }
  }

  static buildPropBase(attribute) {
    const {name: {name}, loc: {start, end}} = attribute

    return {
      name,
      start: this.convertLoc(start),
      end: this.convertLoc(end),
    }
  }

  // <Tag propWithNoValue />
  static buildBooleanProp(attribute) {
    return {
      ...this.buildPropBase(attribute),
      value: true,
      type: AST_TYPES.BooleanLiteral,
    }
  }

  // <Tag propWithoutCurlyBraces="foo" />
  static buildContainerlessProp(attribute) {
    const {valueNode} = attribute
    const {value, loc: {start, end}} = valueNode

    return {
      ...this.buildPropBase(attribute),
      value,
      type: this.getPrimitiveTypeFromNode(valueNode),
      valueStart: this.convertLoc(start),
      valueEnd: this.convertLoc(end),
    }
  }

  static buildNavigationProp(attribute) {
    const {value: {expression}} = attribute
    const {type, loc: {start, end}} = expression
    const {body: CallExpression} = expression

    if (CallExpression.type === 'CallExpression') {
      const {callee: MemberExpression, arguments: args} = CallExpression
      if (MemberExpression.type === 'MemberExpression') {
        const {object: {name: objectName}, property: {name: propertyName}} = MemberExpression
        // console.log(objectName, propertyName, args)
        return {
          ...this.buildPropBase(attribute),
          value: args[0] && args[0].value,
          type: 'func',
          template: '() => Navigator.push(${JSON.stringify(value)})',
          valueStart: this.convertLoc(start),
          valueEnd: this.convertLoc(end),
          interactionEnabled: true,
        }
      }
    }
  }

  // <Tag prop={require('foo')} />
  static buildRequireProp(attribute) {
    const {value: {expression}} = attribute
    const {type, loc: {start, end}} = expression
    const {arguments: args, callee: Identifier} = expression

    if (args.length === 1 && Identifier.name === 'require') {
      if (args[0].type === "StringLiteral") {
        return {
          ...this.buildPropBase(attribute),
          value: args[0] && args[0].value,
          type: AST_TYPES.StringLiteral,
          valueStart: this.convertLoc(start),
          valueEnd: this.convertLoc(end),
        }
      }
    }
  }

  // <Tag prop={'foo'} />
  static buildNormalProp(attribute) {
    const {value: {expression}} = attribute
    const {value, loc: {start, end}} = expression

    return {
      ...this.buildPropBase(attribute),
      value,
      type: this.getPrimitiveTypeFromNode(expression),
      valueStart: this.convertLoc(start),
      valueEnd: this.convertLoc(end),
    }
  }

  // Build a prop from an AST attribute
  // First check for attributes that don't include curly braces
  // After that, all attributes use the "expression container", {}
  static buildProp(attribute) {
    const {value} = attribute

    if (!value) {
      return this.buildBooleanProp(attribute)
    }

    if (value.type === 'StringLiteral') {
      return this.buildContainerlessProp(attribute)
    }

    const {expression: {type}} = value

    if (type == 'ArrowFunctionExpression') {
      return this.buildNavigationProp(attribute)
    }

    if (type == 'CallExpression') {
      return this.buildRequireProp(attribute)
    }

    return this.buildNormalProp(attribute)
  }

  static visitJSXElement(node, root) {
    const element = this.buildJSXElement(node)
    const attributes = node.openingElement.attributes || []

    element.props = attributes.map(this.buildProp.bind(this))

    insertInTree(element, root)
  }

  static elementTreeFromAST(ast) {
    let startTime = Date.now()

    const root = this.buildFakeRootElement()

    ASTUtils.traverse(ast, (node) => {
      if (node.type === 'JSXElement') {
        this.visitJSXElement(node, root)
      }
    })


    return root
  }

  // TODO move elsewhere
  static importsFromAST(ast) {
    const {body} = ast
    let imports = null

    for (var i = 0; i < body.length; i++) {
      const {type, loc: {start, end}} = body[i]

      if (type === 'ImportDeclaration') {
        if (imports) {
          imports.end = end
        } else {
          imports = {start, end}
        }
      // If we encounter a non-import, break
      } else {
        break
      }
    }

    if (! imports) {
      return null
    }

    return {
      start: this.convertLoc(imports.start),
      end: this.convertLoc(imports.end),
    }
  }
}

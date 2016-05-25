"use strict"

const fs = require('fs')
const path = require('path')

function convert(filename) {
  const name = path.basename(filename, '.jsx')
  const data = fs.readFileSync(filename, {encoding: 'utf8'}).split("\n###\n")
  const template = data[0]
  let metadata
  try {
    const metadataPath = path.join(
      path.dirname(filename),
      '/.deco/',
      name + '.jsx.deco'
    )
    metadata = fs.readFileSync(metadataPath, {encoding: 'utf8'})
  } catch (e) {
    return
  }
  const metadataJSON = JSON.parse(metadata)
  
  let override = {}
  if (data[1]) {
    override = eval(data[1])
  }

  const output = Object.assign({
    name: name,
    version: '0.0.1',
    packages: {},
    props: [],
    template: template,
    liveValues: metadataJSON.liveValues,
    parentModule: 'react-native',
    require: [
      "import { " + name + " } from 'react-native'",
    ],
    dependencies: {
      'react-native': [
        name,
      ]
    },
  }, override)

  const outputJSON = JSON.stringify(output, null, '  ')
  
  const dest = path.join(
    __dirname, 
    '../../src/scripts/factories/scaffold/ReactNativeScaffolds/',
    name + '.json'
  )
  
  fs.writeFileSync(dest, outputJSON, 'utf8')
}

fs.readdirSync(__dirname)
  .filter((filename) => filename.match(/.jsx$/))
  .forEach(convert)

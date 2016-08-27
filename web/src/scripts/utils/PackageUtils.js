const bufferedProcess = Electron.remote.require('./process/bufferedProcess')

// Sample output for `npm list package-name`:
//
// {
//   "name": "Project",
//   "version": "0.0.1",
//   "dependencies": {
//     "flow-bin": {
//       "version": "0.31.0",
//       "from": "flow-bin@0.31.0",
//       "resolved": "https://registry.npmjs.org/flow-bin/-/flow-bin-0.31.0.tgz"
//     }
//   }
// }

const errors = [
  // Package is in package.json, but not installed
  // => npm ERR! missing: flow-bin@0.31.1, required by Project@0.0.1
  {type: 'missing', code: 'NOT_INSTALLED'},

  // Package is in package.json, but a different version is installed
  // => npm ERR! invalid: flow-bin@0.31.1 /Users/.../.Deco/tmp/Project/node_modules/flow-bin
  {type: 'invalid', code: 'VERSION_MISMATCH'},

  // Package is not in package.json, but it is installed
  // => npm ERR! extraneous: flow-bin@0.31.1 /Users/.../.Deco/tmp/Project/node_modules/flow-bin
  {type: 'extraneous', code: 'EXTRANEOUS_PACKAGE'},
]

const getVersion = async (global, packageName) => {
  try {
    const result = await bufferedProcess.run('npm', [
      'list',
      packageName,
      '--depth=0',
      '--json',
      ...(global ? ['-g'] : []),
    ])
    const parsed = JSON.parse(result)
    return parsed.dependencies[packageName].version
  } catch (e) {
    const {output} = e
    console.log('out', output)

    errors.forEach(({type, code}) => {
      if (output.startsWith(`npm ERR! ${type}`)) {
        throw ({code})
      }
    })

    // Package is not in package.json and not installed
    throw ({code: 'MISSING'})
  }
}

export const getGlobalVersion = getVersion.bind(null, true)
export const getLocalVersion = getVersion.bind(null, false)

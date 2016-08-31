const bufferedProcess = Electron.remote.require('./process/bufferedProcess')

export const PACKAGE_ERROR = {

  // Package is in package.json, but not installed
  // => npm ERR! missing: flow-bin@0.31.1, required by Project@0.0.1
  NOT_INSTALLED: 'NOT_INSTALLED',

  // Package is in package.json, but a different version is installed
  // => npm ERR! invalid: flow-bin@0.31.1 /Users/.../.Deco/tmp/Project/node_modules/flow-bin
  VERSION_MISMATCH: 'VERSION_MISMATCH',

  // Package is not in package.json, but it is installed
  // => npm ERR! extraneous: flow-bin@0.31.1 /Users/.../.Deco/tmp/Project/node_modules/flow-bin
  EXTRANEOUS_PACKAGE: 'EXTRANEOUS_PACKAGE',

  // Package is not in package.json and not installed
  MISSING: 'MISSING',
}

// Sample success output for `npm list flow-bin`:
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
  {
    type: 'missing',
    code: PACKAGE_ERROR.NOT_INSTALLED,
  },
  {
    type: 'invalid',
    code: PACKAGE_ERROR.VERSION_MISMATCH,
  },
  {
    type: 'extraneous',
    code: PACKAGE_ERROR.EXTRANEOUS_PACKAGE,
  },
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

    errors.forEach((error) => {
      const {type} = error
      if (output.startsWith(`npm ERR! ${type}`)) {
        throw error
      }
    })

    throw ({
      code: PACKAGE_ERROR.MISSING,
    })
  }
}

export const getGlobalVersion = getVersion.bind(null, true)
export const getLocalVersion = getVersion.bind(null, false)

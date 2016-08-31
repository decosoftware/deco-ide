import path from 'path'
import { spawn } from 'child_process'

import fileHandler from '../handlers/fileHandler'

class BufferedProcess {

  static run(cmd, options = {}) {
    if (!cmd) {
      throw new Error("Must provide a command to BufferedProcess.run")
    }

    // Allow passing an array, for simple usage
    if (Array.isArray(options)) {
      options = {args: options}
    }

    let {args = [], cwd, input, onStdOut, onStdErr} = options

    cwd = cwd || fileHandler.getWatchedPath()

    const spawnOptions = {
      env: {
        ...process.env,
        PATH: [
          process.env.PATH,
          path.normalize('/usr/local/Deco/node/bin'),
        ].join(':')
      },
      ...(cwd && {cwd})
    }

    const child = spawn(cmd, args, cwd ? {cwd} : {})

    // Listen to 'error' instead of try/catch
    // https://nodejs.org/docs/latest/api/child_process.html#child_process_event_error
    child.on('error', (e) => {
      // Handle the error in the .on('close')
    })

    let outData = ''
    let errData = ''

    child.stdout.on('data', (data) => {
      const str = data.toString()
      onStdOut && onStdOut(str)
      outData += str
    })

    child.stderr.on('data', (data) => {
      const str = data.toString()
      onStdErr && onStdErr(str)
      errData += str
    })

    const promise = new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code === 0) {
          resolve(outData)
        } else {
          reject({code, output: errData})
        }
      })
    })

    // Send input
    if (input) {
      child.stdin.write(input)
      child.stdin.end()
    }

    return promise
  }
}

module.exports = BufferedProcess

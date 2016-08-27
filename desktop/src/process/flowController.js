import path from 'path'
import fs from 'fs'
import { spawn, } from 'child_process'
import fileHandler from '../handlers/fileHandler'
import BufferedProcess from './bufferedProcess'

class FlowController {

  constructor() {
    this.server = null
    this.currentDirectory = null

    process.on('exit', () => this.stopServer())
    process.on('SIGINT', () => this.stopServer())
  }

  runCommand({args, cwd, input, onData, onError, onComplete}) {
    const cmd = this.getBinaryPath()
    console.log('running cmd', cmd, args, {cwd})

    const child = spawn(cmd, args, cwd ? {cwd} : {})

    // Listen to 'error' instead of try/catch
    // https://nodejs.org/docs/latest/api/child_process.html#child_process_event_error
    child.on('error', (e) => {
      console.log('failed to spawn flow process', e)
    })

    let output = ''

    child.stdout.on('data', (data) => {
      const str = data.toString()
      onData && onData(str)

      // Buffer output
      if (onComplete) {
        output += str
      }
    })

    onError && child.stderr.on('data', (data) => {
      const str = data.toString()
      onError(str)
    })

    onComplete && child.on('close', (code) => {
      console.log("closed", code)
      if (code === 0) {
        onComplete(null, output)
      } else {
        onComplete({code})
      }
    })

    // Send input
    if (input) {
      child.stdin.write(input)
      child.stdin.end()
    }

    return child
  }

  startServer() {
    const {server, currentDirectory} = this
    const root = fileHandler.getWatchedPath()

    if (server) {

      // Server already running in this directory
      if (currentDirectory === root) {
        console.log('SERVER >> already running server')
        return

      // Server running in a different directory
      } else {
        console.log('SERVER >> restarting server')
        this.stopServer()
      }
    }

    try {
      this.server = this.runCommand({
        args: ['server', '--lib', 'lib'],
        cwd: root,
        onError: (data) => console.log('Flow Info:', data)
      })
      this.currentDirectory = root
      console.log("Started flow server")
    } catch (e) {
      this.server = null
      console.log("Failed to start flow server", e)
    }
  }

  stopServer() {
    if (!this.server) return

    this.server.kill()
  }

  getBinaryPath() {
    const root = fileHandler.getWatchedPath()
    return path.join(root, 'node_modules/.bin/flow')
  }

  getFlowConfigVersion() {
    const root = fileHandler.getWatchedPath()
    const configPath = path.join(root, '.flowconfig')
    return new Promise((resolve, reject) => {
      fs.readFile(configPath, (err, data) => {
        if (err) {
          reject(err)
          return
        }

        const match = data.toString().match(/\[version\]\n(.*)\n/)
        if (match) {
          resolve(match[1])
        } else {
          resolve(null)
        }
      })
    })
  }

  runFlowCommand(command, input, pos, cwd, filename) {
    const {ch, line} = pos
    const pathArgs = filename ? ['--path', filename] : []

    return new Promise((resolve, reject) => {
      this.runCommand({
        args: [command, line + 1, ch + 1, '--json', ...pathArgs],
        cwd,
        input,
        onComplete: (err, data) => {
          console.log(`completed ${command} on ${filename}`)
          if (err) {
            console.log('err', err)
            reject(err)
          } else {
            console.log(JSON.stringify(JSON.parse(data), null, 2))
            resolve(JSON.parse(data))
          }
        },
      })
    })
  }

  getType(input, pos, filename) {
    return this.runFlowCommand('type-at-pos', input, pos, path.dirname(filename), filename)
  }

  getDefinition(input, pos, filename) {
    return this.runFlowCommand('get-def', input, pos, path.dirname(filename), filename)
  }

  getCompletion(input, pos, filename) {
    return this.runFlowCommand('autocomplete', input, pos, path.dirname(filename))
  }
}

module.exports = new FlowController()

import path from 'path'
import fs from 'fs'
import { spawn, } from 'child_process'
import fileHandler from '../handlers/fileHandler'
import bufferedProcess from './bufferedProcess'

class FlowController {

  constructor() {
    this.resetState()

    process.on('exit', () => this.stopServer())
    process.on('SIGINT', () => this.stopServer())
  }

  resetState() {
    this.server = null
    this.currentDirectory = null
  }

  startServer() {
    const {server, currentDirectory} = this
    const root = fileHandler.getWatchedPath()

    if (server) {

      // Server already running in this directory => do nothing
      if (currentDirectory === root) {
        return

      // Server running in a different directory => restart in this directory
      } else {
        this.stopServer()
      }
    }

    this.server = spawn(this.getBinaryPath(), ['server', '--lib', 'lib'], {cwd: root})
    this.currentDirectory = root

    // Catch spawn errors (akin to try/catch)
    this.server.on('error', this.resetState.bind(this))
  }

  stopServer() {
    if (!this.server) return

    this.server.kill()
  }

  runFlowCommand(command, input, pos, cwd, filename) {
    const {ch, line} = pos
    const pathArgs = filename ? ['--path', filename] : []
    const args = [command, line + 1, ch + 1, '--json', ...pathArgs]

    return bufferedProcess.run(this.getBinaryPath(), {cwd, args, input})
      .then((data) => JSON.parse(data))
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

  async getAST(input, filename) {
    return bufferedProcess.run(this.getBinaryPath(), {
      cwd: path.dirname(filename),
      args: ['ast'],
      input,
    })
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
}

module.exports = new FlowController()

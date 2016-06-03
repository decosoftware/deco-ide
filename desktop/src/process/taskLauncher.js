import child_process from 'child_process'

const LIB_FOLDER = require('../fs/model').LIB_FOLDER
const TASK_RUNNER = './Scripts/deco-cli/bin/deco-cli'
import fileHandler from '../handlers/fileHandler'

class TaskLauncher {
  static runTask(taskname, args, options) {
    if (!options) options = {}
    options.env = Object.assign({}, options.env || {}, process.env)

    if (!args) {
      args = []
    }

    const PROJECT_PATH = fileHandler.getWatchedPath()
    return child_process.spawn(TASK_RUNNER, [taskname, '-r', PROJECT_PATH].concat(args), Object.assign({} , options, {
      cwd: LIB_FOLDER,
    }))
  }
}


export default TaskLauncher

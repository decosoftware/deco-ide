import fs from 'fs'
import Logger from '../log/logger'
const queues = {}

class WriteQueue {
  constructor() {
    this.queue = [];
  }
  next() {
    if (this.queue.length === 0) {
      return
    }
    const { path, content, onComplete } = this.queue[0]
    try {
      Logger.info('writing to path: ', path)
      fs.writeFile(path, content, 'utf8', (err) => {
        this.queue.shift()
        onComplete(err)
      })
    } catch (e) {
      Logger.error(e)
      onComplete(e)
    }
  }
  add(writeInfo) {
    this.queue.push(writeInfo)
    if (this.queue.length === 1) {
      this.next()
    }
  }
}

export const writeFile = (path, content, cb) => {
  let queue = queues[path]
  if (!queue) {
    queue = queues[path] = new WriteQueue()
  }
  queue.add({
    path,
    content,
    onComplete: (err) => {
      cb(err)
      queue.next()
    }
  })
}

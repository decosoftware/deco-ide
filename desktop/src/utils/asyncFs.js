import fs from 'fs'

export const readFile = async (filepath, options = 'utf8') => {
  if (!filepath) {
    return Promise.reject('filepath argument was undefined or null')
  }
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, options, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

export const writeFile = async (filepath, data, options = 'utf8') => {
  if (!filepath) {
    return Promise.reject('filepath argument was undefined or null')
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, options, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

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

const path = require('path')
const fs = require('fs')
const readline = require('readline')
const child_process = require('child_process')

const getChangedFiles = () => {
  const filenames = child_process.execSync('git diff-tree --no-commit-id --name-only -r HEAD').toString('utf8')

  return filenames.split('\n').map(s => s.trim()).filter(x => x.match(/jsx?$/))
}

const getRootDirectory = () => {
  return child_process.execSync('git rev-parse --show-toplevel').toString('utf8').trim()
}

const rl = readline.createInterface({input: process.stdin, output: process.stdout})

const promptAndWrite = (root, filenames, index) => {
  const filename = filenames[index]

  if (filename) {
    const filepath = path.join(root, filename)
    let text, lines, comments, linesWithComments

    try {
      text = fs.readFileSync(filepath).toString('utf8')
      lines = text.split('\n')

      // [[num, comment], ...]
      comments = lines.map((line, i) => [i, line.match(/^\s*\/\/.*$/)]).filter(x => x[1]).map(x => [x[0], x[1][0]])
      linesWithComments = comments.map(([num]) => num)

      if (comments.length === 0) {
        return promptAndWrite(root, filenames, index + 1)
      }
    } catch (e) {
      return promptAndWrite(root, filenames, index + 1)
    }

    console.log(`--- ${filepath} ---\n`)

    comments.forEach(([num, comment]) => {
      console.log(num, comment)
    })

    rl.question(`Strip comments from ${filepath}?\n`, (answer) => {

      const write = () => {
        const updated = lines.filter((line, i) => linesWithComments.indexOf(i) === -1).join('\n')
        fs.writeFileSync(filepath, updated)
      }

      // Answer 'y' to strip all comments
      if (answer.startsWith('y')) {
        write()

      // Answer with a list of line numbers, e.g. "1 38 120" to remove specific line comments
      } else {
        linesWithComments = answer.split(' ').map(s => s.trim()).map(x => parseInt(x)).filter(x => !isNaN(x))
        write()
      }

      promptAndWrite(root, filenames, index + 1)
    })
  } else {
    rl.close()
  }
}

const root = getRootDirectory()
const filenames = getChangedFiles()

promptAndWrite(root, filenames, 0)

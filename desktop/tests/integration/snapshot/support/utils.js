import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { expect } from 'chai'
import imageDiff from 'image-diff'


const TESTS_PATH = './tests/integration/snapshot'
const TEMP_PATH = path.join(TESTS_PATH, 'tmp')
const EXPECTATIONS_PATH = path.join(TESTS_PATH, 'expectations')

const DEFAULT_TOLERANCE = 0.001


function getTestTitle(testContext) {
  // currentTest for the 'afterEach', test for the 'it'
  return (testContext.currentTest || testContext.test).fullTitle()
}

function getTestSnapshotFileName(testContext) {
  return path.join(TEMP_PATH, `${getTestTitle(testContext)}.png`)
}

function getExpectedSnapshotFileName(testContext) {
  return path.join(EXPECTATIONS_PATH, `${getTestTitle(testContext)}.png`)
}

function getDiffFileName(testContext) {
  return path.join(TEMP_PATH, `${getTestTitle(testContext)}_diff.png`)
}

function ensurePaths() {
  [TEMP_PATH, EXPECTATIONS_PATH].forEach((path) => mkdirp(path, '0777'))
}

export function expectToMatchSnapshot(testContext, done) {
  ensurePaths()
  setTimeout(() => {
    testContext.app.browserWindow.capturePage().then((imageBuffer) => {
      const actualFileName = getTestSnapshotFileName(testContext)
      const expectedFileName = getExpectedSnapshotFileName(testContext)
      const diffFileName = getDiffFileName(testContext)
      fs.writeFile(actualFileName, imageBuffer)

      imageDiff.getFullResult({
        actualImage: actualFileName,
        expectedImage: expectedFileName,
        diffImage: diffFileName,
      }, (err, result) => {
        if (err) {
          console.error(`Error while diffing: ${err}`)
          return
        }
        const tolerance = testContext.snapshotTolerance || DEFAULT_TOLERANCE
        expect(result.percentage).to.be.below(tolerance)
        done()
      })
    }).catch(console.log.bind(console))
  }, 5000)
}

export function tearDown(testContext) {
  if (testContext.currentTest.state === 'passed') {
    rimraf.sync(getTestSnapshotFileName(testContext))
    rimraf.sync(getDiffFileName(testContext))
  }
}

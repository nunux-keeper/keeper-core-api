'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('./logger')

const varDir = path.normalize(path.join(__dirname, '..', '..', 'var'))
const db = {}

/**
 * Generic function to read lines of text file.
 * @param {Stream} input input stream
 * @param {Function} func function to apply on each line
 */
const readLines = function (input, func) {
  let remaining = ''
  let nbLines = 0
  input.on('data', function (data) {
    remaining += data
    let index = remaining.indexOf('\n')
    let last = 0
    while (index > -1) {
      const line = remaining.substring(last, index)
      last = index + 1
      func(line)

      nbLines++
      index = remaining.indexOf('\n', last)
    }

    remaining = remaining.substring(last)
  })

  input.on('end', function () {
    if (remaining.length > 0) {
      func(remaining)
      nbLines++
    }
    logger.debug('Text list loaded: %d items added.', nbLines)
  })
}

const dir = path.join(varDir, 'list')
if (fs.statSync(dir).isDirectory()) {
  fs.readdirSync(dir).forEach((file) => {
    if (/^[a-z_-]+\.txt$/.test(file)) {
      const name = path.basename(file, '.txt')
      logger.debug('Loading %s text file...', name)
      db[name] = new Set()

      const input = fs.createReadStream(path.join(dir, file))
      readLines(input, (line) => {
        db[name].add(line)
      })
    }
  })
}

/**
 * Text list holder.
 */
module.exports = db


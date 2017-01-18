'use strict'

const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

const varDir = path.normalize(path.join(__dirname, '..', '..', 'var'))
const templates = {}

const dir = path.join(varDir, 'templates')
if (fs.statSync(dir).isDirectory()) {
  fs.readdirSync(dir).forEach((file) => {
    if (/^[a-z_-]+\.tmpl$/.test(file)) {
      const name = path.basename(file, '.tmpl')
      logger.debug('Loading %s template file...', name)
      fs.readFile(path.join(dir, file), 'utf8', (err, data) => {
        if (err) {
          return logger.error('Unable to load %s template file', name)
        }
        templates[name] = _.template(data)
      })
    }
  })
}

/**
 * Templates holder.
 */
module.exports = templates


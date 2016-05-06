'use strict'

const logger = require('../helper').logger
const path = require('path')

// Dynamic loading extractors...
const extractors = {}
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.extractor\.js$/.test(file)) {
    const name = path.basename(file, '.extractor.js')
    logger.debug('Loading %s extractor..', name)
    extractors[name] = require(path.join(__dirname, file))
  }
})

module.exports = extractors


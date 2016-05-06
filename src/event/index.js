'use strict'

const fs = require('fs')
const path = require('path')
const logger = require('../helper').logger
const EventEmitter = require('events').EventEmitter

// Dynamic loading Event handlers...
const eventHandlers = {}
fs.readdirSync(__dirname).forEach((event) => {
  const dir = path.join(__dirname, event)
  if (fs.statSync(dir).isDirectory()) {
    eventHandlers[event] = new EventEmitter()

    fs.readdirSync(dir).forEach((file) => {
      if (/^[a-z_]+\.evt\.js$/.test(file)) {
        const name = path.basename(file, '.evt.js')
        logger.debug('Loading %s event handler for %s events...', name, event)
        require(path.join(dir, file))(eventHandlers[event])
      }
    })
  }
})

module.exports = eventHandlers

'use strict'

const logger = require('../helper').logger
const path = require('path')
const pipeline = require('when/pipeline')

// Dynamic loading Decorators...
const decorators = {}
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.decorator\.js$/.test(file)) {
    var name = path.basename(file, '.decorator.js')
    logger.debug('Loading %s decorator...', name)
    decorators[name] = require(path.join(__dirname, file))
  }
})

/**
 * Decorate an object with suplied decorators.
 * @param {Object} obj Object to decorate
 * @param {Function[]} ... Decorator functions
 * @return {Promise} promise of the decoration
 */
decorators.decorate = function (obj, ...decorators) {
  if (!decorators || decorators.length === 0) {
    return Promise.resolve(obj)
  }
  return pipeline(decorators, obj)
}

module.exports = decorators

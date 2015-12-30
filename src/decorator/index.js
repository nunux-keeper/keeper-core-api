'use strict';

const logger = require('../helper').logger,
      pipeline = require('when/pipeline'),
      path   = require('path');

// Dynamic loading Decorators...
const decorators = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.decorator\.js$/.test(file)) {
    var name = path.basename(file, '.decorator.js');
    logger.debug('Loading %s decorator...', name);
    decorators[name] = require(path.join(__dirname, file));
  }
});

/**
 * Decorate an object with suplied decorators.
 * @param {Object} obj Object to decorate
 * @param {Function[]} ... Decorator functions
 * @return {Promise} promise of the decoration
 */
decorators.decorate = function(obj) {
  const decorators = Array.prototype.slice.call(arguments, 1);
  return pipeline(decorators, obj);
};

module.exports = decorators;

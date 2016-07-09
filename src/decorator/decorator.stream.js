'use strict'

const decorator = require('.')
const Transform = require('stream').Transform
const util = require('util')

const DecoratorStream = function (decorators) {
  this.decorators = decorators
  Transform.call(this, {objectMode: true})
}

util.inherits(DecoratorStream, Transform)

DecoratorStream.prototype._transform = function (chunk, encoding, callback) {
  // console.log('DecoratorStream._transform::chunk', chunk)
  decorator.decorate(chunk, ...this.decorators)
  .then((obj) => {
    // console.log('DecoratorStream._transform::obj', obj)
    this.push(obj)
    callback()
  })
  .catch(callback)
}

module.exports = DecoratorStream

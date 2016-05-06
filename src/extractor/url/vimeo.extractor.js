'use strict'

const logger = require('../../helper').logger
const url = require('url')

/**
 * Vimeo URL content extractor.
 * @module vimeo
 */
module.exports = {
  /**
   * Extract content of Vimeo URL.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function (doc) {
    logger.debug('Using Vimeo URL extractor.')

    const u = url.parse(doc.origin)
    const v = u.pathname.split('/')[1]
    doc.content = `<iframe src="//player.vimeo.com/video/${v}"
      width="500" height="281" frameborder="0"
      webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>`
    doc.title = 'Vimeo video: ' + v
    doc.contentType = 'text/html'
    return Promise.resolve(doc)
  },

  /**
   * Detect if the document origin is a Vimeo URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is from Vimeo.
   */
  detect: function (doc) {
    return doc.origin.lastIndexOf('http://vimeo.com', 0) === 0
  }
}

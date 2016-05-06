'use strict'

const logger = require('../../helper').logger
const url = require('url')

/**
 * Youtube URL content extractor.
 * @module youtube
 */
module.exports = {
  /**
   * Extract content of Youtube URL.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function (doc) {
    logger.debug('Using Youtube URL extractor.')

    const u = url.parse(doc.origin, true)
    const v = u.query.v
    doc.content = `<iframe width="560" height="315"
      src="//www.youtube.com/embed/${v}"
      frameborder="0" allowfullscreen></iframe>`
    doc.title = 'Youtube video: ' + v
    doc.contentType = 'text/html'
    return Promise.resolve(doc)
  },

  /**
   * Detect if the document origin is a Youtube URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is from Youtube.
   */
  detect: function (doc) {
    return doc.origin.lastIndexOf('https://www.youtube.com/watch', 0) === 0
  }
}

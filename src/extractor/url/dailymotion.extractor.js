'use strict'

const logger = require('../../helper').logger
const url = require('url')

/**
 * Dailymotion URL content extractor.
 * @module youtube
 */
module.exports = {
  /**
   * Extract content of Dailymotion URL.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function (doc) {
    logger.debug('Using Dailymotion URL extractor.')

    const u = url.parse(doc.origin)
    const v = u.pathname.split('/')[2]
    doc.content = `<iframe frameborder="0" width="480" height="270"
    src="//www.dailymotion.com/embed/video/${v}"  allowfullscreen></iframe>`
    doc.title = 'Dailymotion video: ' + v
    doc.contentType = 'text/html'
    return Promise.resolve(doc)
  },

  /**
   * Detect if the document origin is a Dailymotion URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is from Dailymotion.
   */
  detect: function (doc) {
    return doc.origin.lastIndexOf('http://www.dailymotion.com/video/', 0) === 0
  }
}

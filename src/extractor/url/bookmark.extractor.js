'use strict'

const fs = require('fs')
const validator = require('validator')
const logger = require('../../helper').logger
const errors = require('../../helper').errors
const hash = require('../../helper').hash
const thumbnail = require('../../helper').thumbnail
const request = require('../../helper').request

/**
 * Bookmark extractor.
 * @module url
 */
module.exports = {
  /**
   * Extract thumbnail of an online HTML document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function (doc) {
    logger.debug('Using Bookmark extractor.')
    doc.origin = doc.origin.substring(9)
    if (!validator.isURL(doc.origin)) {
      return Promise.reject(new errors.BadRequest('URL not valid: ' + doc.origin))
    }

    return new Promise(function (resolve, reject) {
      request.head(doc.origin, function (err, res) {
        if (err) {
          return reject(err)
        }
        const contentType = res.headers['content-type']
        if (!/text\/html/.test(contentType)) {
          return reject(new errors.BadRequest('Target document is not a regular HTML page.'))
        }
        return thumbnail.page(doc.origin)
          .then(function (thumbnailFile) {
            logger.debug('Page thumbnailed: ' + thumbnailFile)
            if (!doc.title) {
              doc.title = doc.origin.replace(/.*?:\/\//g, '')
            }
            doc.contentType = 'text/html'
            const attachment = {
              key: hash.hashUrl(doc.origin, 'png'),
              stream: fs.createReadStream(thumbnailFile),
              contentType: 'image/png'
            }
            doc.attachments.push(attachment)
            doc.content = `<img data-ref="${attachment.key}" title="Screenshot" />`
            return Promise.resolve(doc)
          })
        .then(resolve, reject)
      })
    })
  },

  /**
   * Detect if the document origin is a cwbookmarkDailymotion URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is a bookmark
   */
  detect: function (doc) {
    return doc.origin.lastIndexOf('bookmark+http', 0) === 0
  }
}

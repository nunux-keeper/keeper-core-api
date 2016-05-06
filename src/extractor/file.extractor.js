'use strict'

const fs = require('fs')
const hash = require('../helper').hash
const logger = require('../helper').logger

/**
 * Add attachment.
 * @param {Document} doc The document
 * @param {File} file The file to add as attachment
 * @return {Document} update doc.
 */
var addAttachment = function (doc, file) {
  logger.debug('Add file attachment %s to document...', file.originalFilename)
  doc.attachments.push({
    key: hash.hashFilename(file.originalFilename),
    stream: fs.createReadStream(file.path),
    contentType: file.headers['content-type']
  })
  return doc
}

/**
 * File content extractor.
 * @module file
 */
module.exports = {
  /**
   * Extract uploaded content of a document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function (doc) {
    if (doc.files) {
      logger.debug('Using File extractor.')
      doc.files.forEach(function (file) {
        addAttachment(doc, file)
      })
      delete doc.files
    }
    return Promise.resolve(doc)
  }
}

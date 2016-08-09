'use strict'

const _ = require('lodash')
const mime = require('mime')
const cleaner = require('./html.cleaner')
const logger = require('../../helper').logger
const hash = require('../../helper').hash
const readability = require('node-readability')

/**
 * Extract base URL from the document head.
 * @param {Object} document DOM
 * @return {String} the base URL in the document head.
 */
const extractBaseUrl = function (document) {
  if (!document.head) {
    return null
  }
  const base = document.head.getElementsByTagName('base')[0]
  if (base && base.hasAttribute('href')) {
    let baseUrl = base.getAttribute('href')
    if (/^\/\//i.test(baseUrl)) {
      baseUrl = 'http:' + baseUrl
    }
    logger.debug('Base URL found in the head: %s', baseUrl)
    return baseUrl
  } else {
    return null
  }
}

/**
 * Extract resources from document content.
 * For now, only images are extracted.
 * @param {String} content HTML content
 * @return {Object} resources
 */
const extractResources = function (content) {
  let m
  const resources = []
  const rex = /<img[^>]+app-src="?([^"\s]+)"?/g
  while ((m = rex.exec(content)) !== null) {
    const url = m[1]
    resources.push({
      key: hash.hashUrl(url),
      contentType: mime.lookup(url.replace(/\?.*$/, '')),
      origin: url
    })
  }
  return resources
}

/**
 * Extract and clean HTML content of a document using Readability.
 * @param {Document} doc
 * @returns {Promise} Promise of the doc with clean HTML content.
 */
const extractHtml = function (doc) {
  return new Promise(function (resolve, reject) {
    readability(doc.content, function (err, read) {
      if (err) {
        return reject(err)
      }
      const baseUrl = extractBaseUrl(read.document) || doc.origin
      cleaner.cleanup(read.document, {baseUrl: baseUrl})
      // Try to get page main content...
      doc.content = read.document.body.innerHTML
      const articleContent = read.content
      if (articleContent) {
        doc.content = articleContent
      }
      if (!doc.title && read.title) {
        doc.title = read.title
      }
      const resources = extractResources(doc.content)
      doc.attachments = _.uniqWith(
        doc.attachments.concat(resources),
        _.isEqual
      )
      resolve(doc)
    })
  })
}

/**
 * HTML content extractor.
 * @module html
 */
module.exports = {
  /**
   * Test if the extractor support the provided document.
   * @param {Document} doc
   * @return {Boolean} support status
   */
  support: function (doc) {
    return /^text\/html/.test(doc.contentType)
  },
  /**
   * Extract HTML content a document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted HTML.
   */
  extract: function (doc) {
    logger.debug('Using html extractor.')
    if (doc.content) {
      return extractHtml(doc)
    } else {
      logger.debug('No HTML content to parse.')
      doc.content = ''
      return Promise.resolve(doc)
    }
  }
}

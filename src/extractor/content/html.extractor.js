'use strict'

const _ = require('lodash')
const mime = require('mime')
const cleaner = require('./html.cleaner')
const logger = require('../../helper').logger
const hash = require('../../helper').hash
const readability = require('node-readability')
const jsdom = require('jsdom')

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
 * Extract Open Graph properties from the document head.
 * @param {Object} document DOM
 * @return {Object} open graph properties
 */
const extractOpenGraphProps = function (document) {
  const result = {}
  if (!document.head) {
    return result
  }
  const metas = document.head.getElementsByTagName('meta')
  for (let tag of metas) {
    const attr = tag.getAttribute('property')
    if (attr !== null && attr.startsWith('og:')) {
      const prop = attr.substr(3)
      result[prop] = tag.getAttribute('content')
    }
  }
  return result
}

/**
 * Extract resources from document content.
 * For now, only images are extracted.
 * @param {Object} doc Document
 * @param {Object} document DOM
 * @return {Object} the document
 */
const extractResources = function (doc, document) {
  // Extract resources from the DOM and remove src attribute
  // from the DOM in order to prevent direct reference.
  const resources = []
  if (doc.metas.image) {
    // Add document Open Graph illustration in first position
    // This in order to be the document illustration.
    const src = doc.metas.image
    resources.push({
      key: hash.hashUrl(src),
      contentType: mime.lookup(src.replace(/\?.*$/, '')),
      origin: src
    })
  }
  const images = document.getElementsByTagName('img')
  for (let img of images) {
    if (img.hasAttribute('src')) {
      const src = img.getAttribute('src')
      if (src && !/^data:/i.test(src)) {
        const resource = {
          key: hash.hashUrl(src),
          contentType: mime.lookup(src.replace(/\?.*$/, '')),
          origin: src
        }
        img.removeAttribute('src')
        img.setAttribute('data-ref', resource.key)
        resources.push(resource)
        logger.debug('Resource registered:', resource)
      }
    }
  }
  doc.content = document.body.innerHTML
  // Build attachment array by merging extracted resources with current resources.
  // Extracted resources are append before in order to update illustration extraction.
  doc.attachments = _.uniqWith(
    resources.concat(doc.attachments),
    _.isEqual
  )
  return doc
}

/**
 * Extract and clean HTML content of a document using Readability.
 * @param {Document} doc
 * @param {Oject} meta Meta data used toconfigure the extractor
 * @returns {Promise} Promise of the doc with clean HTML content.
 */
const extractHtml = function (doc, meta) {
  return new Promise(function (resolve, reject) {
    readability(doc.content, function (err, read) {
      if (err) {
        return reject(err)
      }
      return resolve(read)
    })
  })
  .then((read) => {
    // Step 1: Clean up the DOM
    const baseUrl = extractBaseUrl(read.document) || doc.origin
    doc.metas = extractOpenGraphProps(read.document)
    cleaner.cleanup(read.document, {baseUrl: baseUrl})
    // Step 2: Ask to Readability to extract the main content
    // But before save the whole content in case of Readability fails
    doc.content = read.document.body.innerHTML
    let dom = Promise.resolve(read.document)
    if (meta.detectMainContent && read.content) {
      // Readability founds the main content.
      doc.content = read.content
    }
    if (meta.detectMainContent) {
      // We have to put back this content to a DOM for further manipulations...
      // This is not very clean but we don't have the possibility to get the DOM
      // of the content from Readability. DOM is mutated :(
      dom = new Promise(function (resolve, reject) {
        jsdom.env(doc.content, function (err, window) {
          if (err) {
            window.close()
            return reject(err)
          }
          return resolve(window.document)
        })
      })
    }
    // Step 3: Setup the title if not provided
    if (!doc.title && read.title) {
      // Extract title from metas or header
      doc.title = doc.metas.title || read.title
    }
    return dom
  })
  .then((dom) => {
    // Final Step: Extract resources from the content
    return Promise.resolve(extractResources(doc, dom))
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
   * @param {Oject} meta Meta data used toconfigure the extractor
   * @return {Promise} Promise of the document with extracted HTML.
   */
  extract: function (doc, meta) {
    logger.debug('Using html extractor.')
    if (doc.content) {
      return extractHtml(doc, meta)
    } else {
      logger.debug('No HTML content to parse.')
      doc.content = ''
      return Promise.resolve(doc)
    }
  }
}

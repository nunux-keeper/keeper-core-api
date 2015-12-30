'use strict';

const when    = require('when'),
      mime    = require('mime'),
      cleaner = require('./html.cleaner'),
      logger  = require('../../helper').logger,
      hash    = require('../../helper').hash,
      readability = require('node-readability');

/**
 * Extract base URL from the document head.
 * @param {Object} document DOM
 * @return {String} the base URL in the document head.
 */
const extractBaseUrl = function(document) {
  if (!document.head) {
    return null;
  }
  const base = document.head.getElementsByTagName('base')[0];
  if (base && base.hasAttribute('href')) {
    let baseUrl = base.getAttribute('href');
    if (/^\/\//i.test(baseUrl)) {
      baseUrl = 'http:' + baseUrl;
    }
    logger.debug('Base URL found in the head: %s', baseUrl);
    return baseUrl;
  } else {
    return null;
  }
};

/**
 * Extract resources from document content.
 * For now, only images are extracted.
 * @param {String} content HTML content
 * @return {Object} resources
 */
const extractResources = function(content) {
  let m, resources = [], rex = /<img[^>]+app-src="?([^"\s]+)"?/g;
  while ((m = rex.exec(content)) !== null) {
    const url = m[1];
    resources.push({
      key: hash.hashUrl(url),
      contentType: mime.lookup(url.replace(/\?.*$/,'')),
      origin: url
    });
  }
  return resources;
};

/**
 * Extract and clean HTML content of a document using Readability.
 * @param {Document} doc
 * @returns {Promise} Promise of the doc with clean HTML content.
 */
const extractHtml = function(doc) {
  return new Promise(function(resolve, reject) {
    readability(doc.content, function(err, read) {
      if (err) {
        return reject(err);
      }
      const baseUrl = extractBaseUrl(read.document) || doc.origin;
      cleaner.cleanup(read.document, {baseUrl: baseUrl});
      // Try to get page main content...
      doc.content = read.document.body.innerHTML;
      const articleContent = read.content;
      if (articleContent) {
        doc.content = articleContent;
      }
      if (!doc.title && read.title) {
        doc.title = read.title;
      }
      Array.prototype.push.apply(doc.attachments, extractResources(doc.content));
      resolve(doc);
    });
  });
};


/**
 * HTML content extractor.
 * @module html
 */
module.exports = {
  /**
   * Test if the extractor support the provided content-type.
   * @param {String} ct the conten-type
   * @return {Boolean} support status
   */
  support: function(ct) {
    return /^text\/html/.test(ct);
  },
  /**
   * Extract HTML content a document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted HTML.
   */
  extract: function(doc) {
    logger.debug('Using html extractor.');
    if (doc.content && doc.content !== '') {
      return extractHtml(doc);
    } else {
      return when.reject('Content not found.');
    }
  }
};

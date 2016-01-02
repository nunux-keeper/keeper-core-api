'use strict';

const _       = require('lodash'),
      path    = require('path'),
      logger  = require('../helper').logger;

// Load content extractors
const contentExtractors = {};
require('fs').readdirSync(path.join(__dirname, 'content')).forEach((file) => {
  if (/^[a-z_]+\.extractor\.js$/.test(file)) {
    const name = path.basename(file, '.extractor.js');
    logger.debug('Loading %s content extractor..', name);
    contentExtractors[name] = require(path.join(__dirname, 'content', file));
  }
});

const extractContent = function(doc) {
  const extractor = _.find(contentExtractors, function(ext) {
      return ext.support(doc);
    });
  if (extractor) {
    return extractor.extract(doc);
  } else {
    logger.debug('No content extractor found for content type: %s. Using none.', doc.contentType);
    return Promise.resolve(doc);
  }
};

/**
 *Content extractor.
 * @module content.extractor
 */
module.exports = {
  /**
   * Extract content of a document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    const textAttachment = _.find(doc.attachments, function(att) {
      return /^text\//.test(att.contentType);
    });
    if (textAttachment) {
      // The attachment is the doc
      logger.debug('Extracting content from the attachment...', textAttachment.key);
      doc.contentType = textAttachment.contentType;
      return new Promise(function(resolve, reject) {
        const bufs = [];
        textAttachment.stream.on('data', function(d){ bufs.push(d); });
        textAttachment.stream.on('error', reject);
        textAttachment.stream.on('end', function() {
          doc.content = Buffer.concat(bufs).toString();
          _.remove(doc.attachments, function(att) {
            if (att.key === textAttachment.key) {
              logger.debug('Removing content attachment...', textAttachment.key);
              return true;
            }
            return false;
          });
          extractContent(doc).then(resolve, reject);
        });
      });
    } else {
      logger.debug('Extracting content form the document...', doc.content);
      return extractContent(doc);
    }
  }
};

'use strict';

const url     = require('url'),
      path    = require('path'),
      zlib    = require('zlib'),
      hash    = require('../helper').hash,
      logger  = require('../helper').logger,
      request = require('../helper').request;

// Load URL extractors
const urlExtractors = {};
require('fs').readdirSync(path.join(__dirname, 'url')).forEach((file) => {
  if (/^[a-z_]+\.extractor\.js$/.test(file)) {
    const name = path.basename(file, '.extractor.js');
    logger.debug('Loading %s URL extractor..', name);
    urlExtractors[name] = require(path.join(__dirname, 'url', file));
  }
});

const defaultExtractor = {
  extract: function(doc) {
    logger.debug('Using default URL extractor.');
    return new Promise(function(resolve, reject) {
      request.head(doc.origin, function (err, res) {
        if (err) {
          return reject(err);
        }
        let filename = url.parse(doc.origin).pathname;
        filename = filename.substring(filename.lastIndexOf('/') + 1);
        const encoding = res.headers['content-encoding'];
        let stream = null;
        if (encoding === 'gzip') {
          stream = request.get(doc.link).pipe(zlib.createGunzip());
        } else if (encoding === 'deflate') {
          stream = request.get(doc.link).pipe(zlib.createInflate());
        } else {
          stream = request.get(doc.link);
        }

        doc.attachments.push({
          key: hash.hashUrl(doc.origin),
          stream: stream,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length']
        });

        resolve(doc);
      });
    });
  }
};

/**
 * URL content extractor.
 * @module url
 */
module.exports = {
  /**
   * Extract online content of a document.
   * Redirect to proper extractor regarding content-type.
   * If content-type is not supported, document is return as is.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    if (doc.origin && !doc.content) {
      let extractor = null;
      for (let ext in urlExtractors) {
        if (urlExtractors[ext].detect(doc)) {
          extractor = urlExtractors[ext];
          break;
        }
      }
      if (extractor) {
        return extractor.extract(doc);
      } else {
        return defaultExtractor.extract(doc);
      }
    } else {
      return Promise.resolve(doc);
    }
  }
};

'use strict';

const searchengine = require('../../dao/searchengine');

/**
 * Document event handler.
 */
module.exports = function(documentEventHandler) {
  // Exit if disabled...
  if (searchengine.disabled) {
    return;
  }

  documentEventHandler.on('create', (doc) => searchengine.indexDocument(doc));
  documentEventHandler.on('update', (doc) => searchengine.reindexDocument(doc));
  documentEventHandler.on('remove', (doc) => searchengine.unindexDocument(doc));
};

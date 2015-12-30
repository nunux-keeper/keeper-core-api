'use strict';

const logger = require('../../helper').logger;

/**
 * Index the document.
 */
const indexDocument = function(/*document*/) {
  logger.debug('Indexing the document...');
  // TODO index the document
};

/**
 * Unindex the document.
 */
const unindexDocument = function(/*document*/) {
  logger.debug('Unindexing the document...');
  // TODO unindex the document
};


/**
 * Document event handler.
 */
module.exports = function(documentEventHandler) {
  documentEventHandler.on('create', indexDocument);
  documentEventHandler.on('update', indexDocument);
  documentEventHandler.on('remove', unindexDocument);
};

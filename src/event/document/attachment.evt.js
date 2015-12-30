'use strict';

const logger   = require('../../helper').logger,
      storage  = require('../../storage'),
      download = require('../../downloader');

/**
 * Download document's attachments.
 */
const downloadAttachments = function(doc) {
  if (doc.attachments && doc.attachments.length) {
    logger.debug('Downloading document attachments...');
    download(doc.attachments, storage.getContainerName(doc.owner, 'documents', doc.id, 'files'));
  }
};

/**
 * Synchronize document's attachments.
 */
const synchronizeAttachments = function(doc) {
  logger.debug('Synchronizing document attachments...');
  const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files');
  storage.cleanContainer(container, doc.attachments)
    .then(function() {
      downloadAttachments(doc);
    });
};


/**
 * Remove document's attachments.
 */
const removeAttachments = function(doc) {
  logger.debug('Removing document attachments...');
  storage.remove(storage.getContainerName(doc.owner, 'documents', doc.id));
};


/**
 * Document event handler.
 */
module.exports = function(documentEventHandler) {
  documentEventHandler.on('create', downloadAttachments);
  documentEventHandler.on('update', synchronizeAttachments);
  documentEventHandler.on('remove', removeAttachments);
};

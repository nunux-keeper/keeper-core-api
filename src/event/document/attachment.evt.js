'use strict';

const _        = require('lodash'),
      logger   = require('../../helper').logger,
      storage  = require('../../storage'),
      download = require('../../downloader');

/**
 * Download document's attachments.
 */
const downloadAttachments = function(doc) {
  const attachments = _.filter(doc.attachments, function(attachment) {
    return attachment.origin;
  });
  if (attachments && attachments.length) {
    logger.debug('Downloading document attachments...', doc.id);
    download(attachments, storage.getContainerName(doc.owner, 'documents', doc.id, 'files'));
  }
};

/**
 * Synchronize document's attachments.
 */
const synchronizeAttachments = function(doc) {
  logger.debug('Synchronizing document attachments...', doc.id);
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
  logger.debug('Removing document attachments...', doc.id);
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

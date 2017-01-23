'use strict'

const logger = require('../../helper').logger
const storage = require('../../storage')
const downloadService = require('../../service/download.service')

/**
 * Download document's attachments.
 */
const downloadAttachments = function (doc) {
  const attachments = doc.attachments.filter(attachment => attachment.origin)
  if (attachments && attachments.length) {
    logger.debug('Downloading document attachments...', doc.id)
    downloadService.download(attachments, storage.getContainerName(doc.owner, 'documents', doc.id, 'files'))
  }
}

/**
 * Synchronize document's attachments.
 */
const synchronizeAttachments = function (doc) {
  logger.debug('Synchronizing document attachments...', doc.id)
  const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files')
  storage.cleanContainer(container, doc.attachments)
  .then(function () {
    downloadAttachments(doc)
  })
  .catch(function (err) {
    logger.error('Error while synchronizing attachments', doc.id, err)
  })
}

/**
 * Remove document's attachments.
 */
/*
const removeAttachments = function(doc) {
  logger.debug('Removing document attachments...', doc.id);
  storage.remove(storage.getContainerName(doc.owner, 'documents', doc.id));
};
*/

/**
 * Document event handler.
 */
module.exports = function (documentEventHandler) {
  documentEventHandler.on('create', downloadAttachments)
  documentEventHandler.on('update', synchronizeAttachments)
  // documentEventHandler.on('remove', removeAttachments)
  // Let's the action to the ghostbuster
}

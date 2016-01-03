'use strict';

const when       = require('when'),
      logger     = require('../helper').logger,
      errors     = require('../helper').errors,
      storage    = require('../storage'),
      extractor  = require('../extractor'),
      documentDao  = require('../dao').document,
      eventHandler = require('../event');

/**
 * Process document attachments.
 * @param {Object} doc The document
 * @return {Promise} processing promise
 */
const processAttachments = function(doc) {
  let tasks = [];
  doc.attachments.forEach(function(attachment) {
    if (attachment.stream) {
      const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files');
      tasks.push(storage.store(container, attachment.key, attachment.stream)
        .then(function() {
          delete attachment.stream;
          return Promise.resolve(attachment);
        }));
    }
  });
  if (tasks.length) {
    return Promise.all(tasks).then(function() {
      return Promise.resolve(doc);
    });
  } else {
    return Promise.resolve(doc);
  }
};

/**
 * Document services.
 * @module document.service
 */
const DocumentService = {};

/**
 * Get a document.
 * @param {String} docId Document ID
 * @return {Object} the document
 */
DocumentService.get = function(docId) {
  return documentDao.get(docId);
};

/**
 * Search documents.
 * @param {String} owner Owner of the document
 * @param {String} query Search query
 * @return {Object} the documents
 */
DocumentService.search = function(owner, query) {
  return documentDao.search(owner, query);
};

/**
 * Create a document.
 * @param {Object} doc Document to create
 * @return {Object} the created document
 */
DocumentService.create = function(doc) {
  doc.attachments = [];
  // First try to extract document content from file(s)
  //logger.debug('Document to extract: %j', doc);
  return extractor.file.extract(doc)
    .then(function(_doc) {
      // Then try to extract document content from url
      //logger.debug('Document file extracted: %j', _doc);
      return extractor.url.extract(_doc);
    }).then(function(_doc) {
      // Then try to extract document content
      //logger.debug('Document url extracted: %j', _doc);
      return extractor.content.extract(_doc);
    }).then(function(_doc) {
      // Create document
      //logger.debug('Document extracted: %j', _doc);
      return documentDao.create(_doc);
    }).then(function(_doc) {
      // Process attachments (streams)
      return processAttachments(_doc);
    }).then(function(_doc) {
      logger.info('Document created: %j', _doc);
      // Broadcast document creation event.
      eventHandler.document.emit('create', _doc);
      return Promise.resolve(_doc);
    });
};

/**
 * Update a document.
 * Can only update:
 * - title
 * - content (only if text content type)
 * - categories
 * @param {Object} doc    Document to create
 * @param {Object} update Update to apply
 * @return {Object} the updated document
 */
DocumentService.update = function(doc, update) {
  // Check that content can be modified
  if (update.content) {
    // Extract content
    doc.content = update.content;
    return extractor.content.extract(doc)
      .then(function(_doc) {
        // Udpate content
        update.content = _doc.content;
        update.attachments = _doc.attachments;
        return documentDao.update(doc, update);
      }).then(function(_doc) {
        // Process attachments (streams)
        return processAttachments(_doc);
      }).then(function(_doc) {
        logger.info('Document updated: %j', _doc);
        // Broadcast document update event.
        eventHandler.document.emit('update', _doc);
        return Promise.resolve(_doc);
      });
  }
  // Update document
  return documentDao.update(doc, update)
    .then(function(_doc) {
      logger.info('Document updated: %j', doc.id);
      // Broadcast document update event.
      eventHandler.document.emit('update', _doc);
      return Promise.resolve(_doc);
    });
};

/**
 * Remove documents.
 * @param {String} owner Document owner
 * @param {Array} ids List of documents ID
 * @return {Array} deleted documents
 */
DocumentService.remove = function(owner, ids) {
  const deleteDocument = function(id) {
    return documentDao.get(id)
      .then(function(doc) {
        if (!doc) {
          return Promise.reject(new errors.NotFound('Document not found.'));
        }
        if (doc.owner === owner) {
          return documentDao.remove(doc)
            .then(function() {
              logger.info('Document deleted: %s', id);
              // Broadcast document remove event.
              eventHandler.document.emit('remove', doc);
              return Promise.resolve(doc);
            });
        } else {
          return Promise.reject(new errors.Forbidden());
        }
      });
  };

  // Delete defined ids
  return when.map(ids, deleteDocument);
};

/**
 * Remove all documents of the trash bin.
 * @param {String} owner Document owner
 * @return {Object} the document
 */
DocumentService.emptyTrash = function(owner) {
  logger.debug('Emptying trash bin of %s ...', owner);
  // Empty trash bin category
  documentDao.find({ owner: owner, trash: true })
    .then(function(docs) {
      return when.map(docs, function(doc) {
        return documentDao.remove(doc)
          .then(function() {
            logger.info('Document deleted: %s', doc.id);
            // Broadcast document remove event.
            eventHandler.document.emit('remove', doc);
            return Promise.resolve(doc);
          });
      });
    });
};

module.exports = DocumentService;

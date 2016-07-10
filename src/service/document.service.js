'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const storage = require('../storage')
const extractor = require('../extractor')
const documentDao = require('../dao').document
const eventHandler = require('../event')
const decorator = require('../decorator')
const documentGraveyardDao = require('../dao').document_graveyard

function getDocumentContainerName (doc) {
  return storage.getContainerName(doc.owner, 'documents', doc.id, 'files')
}

/**
 * Process document attachments.
 * @param {Object} doc The document
 * @return {Promise} processing promise
 */
const processAttachments = function (doc) {
  let tasks = []
  doc.attachments.forEach(function (attachment) {
    if (attachment.stream !== undefined) {
      const container = getDocumentContainerName(doc)
      tasks.push(storage.store(container, attachment.key, attachment.stream)
        .then(function () {
          delete attachment.stream
          return Promise.resolve(attachment)
        }))
    }
  })
  if (tasks.length) {
    return Promise.all(tasks).then(function () {
      return Promise.resolve(doc)
    })
  } else {
    return Promise.resolve(doc)
  }
}

/**
 * Document services.
 * @module document.service
 */
const DocumentService = {}

/**
 * Get a document.
 * @param {String} docId Document ID
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the document
 */
DocumentService.get = function (docId, decorators) {
  return documentDao.get(docId)
  .then(function (doc) {
    return decorators ? decorator.decorate(doc, ...decorators) : doc
  })
}

/**
 * Get a ghost document.
 * @param {String} docId Document ID
 * @return {Object} the document
 */
DocumentService.getGhost = function (docId) {
  return documentGraveyardDao.get(docId)
}

/**
 * Search documents.
 * @param {String} owner Owner of the document
 * @param {String} query Search query
 * @return {Object} the documents
 */
DocumentService.search = function (owner, query) {
  const _query = _.pick(query, ['from', 'order', 'size', 'q'])
  _query.owner = owner

  return documentDao.search(_.defaults(_query, {order: 'asc', size: 50}))
}

/**
 * Create a document.
 * @param {Object} doc Document to create
 * @return {Object} the created document
 */
DocumentService.create = function (doc) {
  let attachments
  doc.attachments = []
  // First try to extract document content from file(s)
  // logger.debug('Document to extract: %j', doc)
  return extractor.file.extract(doc)
    .then(function (_doc) {
      // Then try to extract document content from url
      // logger.debug('Document file extracted: %j', _doc)
      return extractor.url.extract(_doc)
    }).then(function (_doc) {
      // Then try to extract document content
      // logger.debug('Document url extracted: %j', _doc)
      return extractor.content.extract(_doc)
    }).then(function (_doc) {
      // Create document
      attachments = _doc.attachments
      // logger.debug('Document extracted: %j', _doc)
      const newDoc = _.pick(_doc, ['title', 'content', 'contentType', 'origin', 'labels', 'owner'])
      newDoc.date = new Date()
      newDoc.attachments = []
      attachments.forEach(function (attachment) {
        newDoc.attachments.push(_.pick(attachment, ['key', 'contentType', 'contentLength', 'origin']))
      })
      // TODO check labels
      // Set title if not set
      if (!newDoc.title) {
        newDoc.title = 'Untitled'
      }
      return documentDao.create(newDoc)
    }).then(function (_doc) {
      _doc.attachments = attachments
      // Process attachments (streams)
      return processAttachments(_doc)
    }).then(function (_doc) {
      logger.info('Document created: %j', _doc)
      // Broadcast document creation event.
      eventHandler.document.emit('create', _doc)
      return Promise.resolve(_doc)
    })
}

/**
 * Update a document.
 * Can only update:
 * - title
 * - content (only if text content type)
 * - categories
 * @param {Object} doc    Document to update
 * @param {Object} update Update to apply
 * @return {Object} the updated document
 */
DocumentService.update = function (doc, update) {
  update = _.pick(update, ['title', 'labels', 'content'])
  update.date = new Date()
  // Check that content can be modified
  if (update.content) {
    // Extract content
    doc.content = update.content
    return extractor.content.extract(doc)
      .then(function (_doc) {
        // Udpate content
        update.content = _doc.content
        update.attachments = _doc.attachments
        return documentDao.update(doc, update)
      }).then(function (_doc) {
        // Process attachments (streams)
        return processAttachments(_doc)
      }).then(function (_doc) {
        logger.info('Document updated: %j', _doc)
        // Broadcast document update event.
        eventHandler.document.emit('update', _doc)
        return Promise.resolve(_doc)
      })
  }
  // Update document
  return documentDao.update(doc, update)
    .then(function (_doc) {
      logger.info('Document updated: %j', doc.id)
      // Broadcast document update event.
      eventHandler.document.emit('update', _doc)
      return Promise.resolve(_doc)
    })
}

/**
 * Remove document.
 * @param {Object} doc     Document to delete
 * @return {Array} deleted document
 */
DocumentService.remove = function (doc) {
  doc.date = new Date()
  return documentGraveyardDao.create(doc)
    .then(function () {
      return documentDao.remove(doc)
    })
    .then(function () {
      logger.info('Document deleted: %j', doc.id)
      // Broadcast document remove event.
      eventHandler.document.emit('remove', doc)
      return Promise.resolve(doc)
    })
}

/**
 * Restore deleted document.
 * @param {Object} ghost document to restore
 * @return {Object} the restored document
 */
DocumentService.restore = function (ghost) {
  return documentDao.create(ghost)
    .then(function (doc) {
      return documentGraveyardDao.remove(doc)
    }).then(function (doc) {
      logger.info('Document restored: %j', doc.id)
      // Broadcast document restore event.
      eventHandler.document.emit('restore', doc)
      return Promise.resolve(doc)
    })
}

/**
 * Remove attachment from document.
 * @param {Object}  doc Document
 * @param {Object}  att Attachment
 * @return {Object} the Document
 */
DocumentService.removeAttachment = function (doc, att) {
  // Remove attachment file from doc
  const update = {
    attachments: doc.attachments.reduce((acc, item) => {
      if (item.key !== att.key) {
        acc.push(item)
      }
      return acc
    }, [])
  }
  return documentDao.update(doc, update)
  .then(function (_doc) {
    logger.info('Attachement will be removed from document %s : %j', _doc.id, att)
    // Broadcast document update event (to apply attachment deletion).
    eventHandler.document.emit('update', _doc)
    return Promise.resolve(_doc)
  })
}

/**
 * Add attachment(s) to a document.
 * @param {Object}  doc Document
 * @param {Object}  files Attachment files
 * @return {Object} the Document
 */
DocumentService.addAttachment = function (doc, files) {
  doc.files = files
  return extractor.file.extract(doc)
  .then(processAttachments)
  .then(function (_doc) {
    // Merge attachments into the doc
    const update = {
      attachments: doc.attachments.reduce((acc, item) => {
        acc.push(_.pick(item, ['key', 'contentType', 'contentLength', 'origin']))
        return acc
      }, [])
    }
    // Update the document attachments
    return documentDao.update(doc, update)
  })
  .then(function (_doc) {
    logger.info('Attachement added to document: %j', _doc.id)
    eventHandler.document.emit('update', _doc)
    return Promise.resolve(_doc)
  })
}

module.exports = DocumentService

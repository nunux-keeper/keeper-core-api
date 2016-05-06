'use strict'

const hal = require('hal')
const errors = require('../helper').errors
const decorator = require('../decorator')
const documentService = require('../service').document

module.exports = {
  /**
   * Get a document.
   */
  get: function (req, res, next) {
    if (req.query.raw !== undefined) {
      res.set('Content-Type', req.requestData.document.contentType)
      res.send(req.requestData.document.content)
    } else {
      // Enrich status with computed properties...
      decorator.decorate(
          req.requestData.document,
          decorator.document.privacy()
          )
        .then(function (document) {
          const resource = new hal.Resource(document, req.url)
          res.json(resource)
        }, next)
    }
  },

  /**
   * Search documents.
   */
  search: function (req, res, next) {
    req.checkQuery('from', 'Invalid from param').optional().isAlphanumeric()
    req.checkQuery('size', 'Invalid size param').optional().isInt({ min: 5, max: 100 })
    req.checkQuery('order', 'Invalid order param').optional().isIn(['asc', 'desc'])
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    documentService.search(req.user.id, req.query)
    .then(function (result) {
      // TODO add HAL data
      res.json(result)
    }, next)
  },

  /**
   * Post new document.
   */
  create: function (req, res, next) {
    req.sanitizeBody('title').trim()
    req.checkBody('title', 'Invalid title').notEmpty().isLength(2, 128)
    req.checkBody('origin', 'Invalid link').optional().isURL({require_valid_protocol: false})
    req.checkBody('contentType', 'Invalid content type').optional().isSupportedContentType()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const labels = req.body.labels ? req.body.labels : []
    const contentType = req.body.contentType ? req.body.contentType : 'text/html'

    const doc = {
      title: req.body.title,
      content: req.body.content,
      contentType: contentType,
      origin: req.body.origin,
      owner: req.user.id,
      labels: labels,
      files: req.files
    }

    // Create document...
    documentService.create(doc)
    .then(function (result) {
      return decorator.decorate(
          result,
          decorator.document.privacy()
          )
    })
    .then(function (result) {
      const resource = new hal.Resource(result, req.url + '/' + result.id)
      res.status(201).json(resource)
    }, next)
  },

  /**
   * Update document.
   * Can only update:
   * - title
   * - content (only if text content type)
   * - categories
   */
  update: function (req, res, next) {
    req.sanitizeBody('title').trim()
    req.checkBody('title', 'Invalid title').optional().isLength(2, 128)
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const doc = req.requestData.document

    const update = {
      title: req.body.title,
      labels: req.body.labels,
      content: req.body.content
    }
    documentService.update(doc, update)
    .then(function (result) {
      return decorator.decorate(
          result,
          decorator.document.privacy()
          )
    })
    .then(function (result) {
      const resource = new hal.Resource(result, req.url)
      res.status(200).json(resource)
    }, next)
  },

  /**
   * Delete one or more documents.
   */
  del: function (req, res, next) {
    const doc = req.requestData.document
    documentService.remove(doc)
      .then(function () {
        res.status(204).json()
      }, next)
  },

  /**
   * Restore deleted document.
   */
  restore: function (req, res, next) {
    documentService.get(req.params.id, true)
      .then(function (ghost) {
        if (!ghost) {
          return Promise.reject(new errors.NotFound('Document ghost not found.'))
        }
        // Only allow to see own document.
        if (ghost.owner !== req.user.id) {
          return Promise.reject(new errors.Forbidden())
        }
        return documentService.restore(ghost)
      }).then(function (doc) {
        const resource = new hal.Resource(doc, req.url)
        res.status(200).json(resource)
      }, next)
  }

}

'use strict'

const _ = require('lodash')
const hal = require('hal')
const errors = require('../helper').errors
const decorator = require('../decorator')
const documentService = require('../service').document

const documentSchema = {
  'title': {
    optional: true,
    isLength: {
      options: [{ min: 2, max: 128 }],
      errorMessage: 'Invalid title'
    }
  },
  'origin': {
    optional: true,
    isURL: {
      options: [{require_valid_protocol: false}]
    }
  },
  'contentType': {
    optional: true,
    isSupportedContentType: {}
  }
}

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
    req.checkQuery('size', 'Invalid size param').optional().isInt({ min: 1, max: 100 })
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
    let doc

    // console.log('Content-Type', req.get('Content-Type'))
    // console.log('Content', req.body)

    if (_.isObject(req.body)) {
      req.sanitizeBody('title').trim()
      req.checkBody(documentSchema)
      doc = _.pick(req.body, ['title', 'content', 'contentType', 'origin', 'labels'])
      doc.contentType = doc.contentType || 'text/html'
    } else {
      req.sanitizeQuery('title').trim()
      req.checkQuery(documentSchema)
      doc = _.pick(req.query, ['title', 'origin', 'labels'])
      doc.content = req.body
      doc.contentType = req.get('Content-Type')
    }

    // Validate inputs...
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    // Create document object...
    doc.owner = req.user.id
    doc.files = req.files
    doc.labels = doc.labels || []

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
    let update
    if (_.isObject(req.body)) {
      req.sanitizeBody('title').trim()
      req.checkBody(documentSchema)
      update = _.pick(req.body, ['title', 'content', 'labels'])
    } else {
      req.sanitizeQuery('title').trim()
      req.checkQuery(documentSchema)
      update = _.pick(req.query, ['title', 'labels'])
      if (req.body !== '') {
        update.content = req.body
      }
    }

    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    if (_.isEmpty(update)) {
      return next(new errors.BadRequest('Nothing to update'))
    }

    const doc = req.requestData.document

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

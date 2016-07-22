'use strict'

const errors = require('../helper').errors
const documentService = require('../service').document

/**
 * Middleware to get document form path params.
 */
module.exports = function (req, res, next) {
  documentService.get(req.params.id)
  .then(function (doc) {
    if (!doc) {
      return next(new errors.NotFound('Document not found.'))
    }
    // Only allow to see own document.
    if (doc.owner !== req.user.id) {
      return next(new errors.Forbidden())
    }
    // Only allow to see a non ghost document.
    if (doc.ghost) {
      return next(new errors.NotFound('Document not existing anymore.'))
    }

    if (!req.requestData) {
      req.requestData = {}
    }
    req.requestData.document = doc
    next()
  }, next)
}

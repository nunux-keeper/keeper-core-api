'use strict'

const _ = require('lodash')
const errors = require('../helper').errors
const documentService = require('../service').document

/**
 * Middleware to get document form path params.
 */
module.exports = function (req, res, next) {
  documentService.get(req.params.docid)
  .then(function (doc) {
    if (!doc) {
      return next(new errors.NotFound('Document not found.'))
    }
    if (req.requestData && req.requestData.sharing) {
      // Get a shared document
      const sharing = req.requestData.sharing
      if (!_.includes(doc.labels, sharing.targetLabel)) {
        return next(new errors.BadRequest('Document dont\'t match'))
      }
    } else if (doc.owner !== req.user.id) {
      // Only allow to see own document.
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

'use strict';

const errors = require('../helper').errors,
      validators = require('../helper').validators,
      documentService = require('../service').document;

/**
 * Middleware to get document form path params.
 */
module.exports = function(req, res, next) {
  if (!validators.isDocId(req.params.id)) {
    return next(new errors.BadRequest());
  }
  documentService.get(req.params.id)
  .then(function(doc) {
    if (!doc) {
      return next(new errors.NotFound('Document not found.'));
    }
    // Only allow to see own document.
    if (doc.owner !== req.user.uid) {
      return next(new errors.Forbidden());
    }

    if (!req.requestData) {
      req.requestData = {};
    }
    req.requestData.document = doc;
    next();
  }, next);
};

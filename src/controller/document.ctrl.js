'use strict';

const hal        = require('hal'),
      errors     = require('../helper').errors,
      decorator  = require('../decorator'),
      documentService = require('../service').document;

module.exports = {
  /**
   * Get a document.
   */
  get: function(req, res, next) {
    // Enrich status with computed properties...
    decorator.decorate(
      req.requestData.document,
      decorator.document.privacy()
    )
    .then(function(document) {
      const resource = new hal.Resource(document, req.url);
      res.json(resource);
    }, next);
  },

  /**
   * Search documents.
   */
  search: function(req, res, next) {
    documentService.search(req.user.uid, req.query)
    .then(function(result) {
      // TODO add HAL data
      res.json(result);
    }, next);
  },

  /**
   * Post new document.
   */
  create: function(req, res, next) {
    req.sanitizeBody('title').trim();
    req.checkBody('title', 'Invalid title').notEmpty().isLength(2, 128);
    req.checkBody('origin', 'Invalid link').optional().isURL();
    req.checkBody('contentType', 'Invalid content type').optional().isSupportedContentType();
    const validationErrors = req.validationErrors(true);
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors));
    }

    const labels = req.body.labels ? req.body.labels : [];
    const contentType = req.body.contentType ? req.body.contentType : 'text/html';

    const doc = {
      title:       req.body.title,
      content:     req.body.content,
      contentType: contentType,
      origin:      req.body.origin,
      owner:       req.user.uid,
      labels:      labels,
      files:       req.files
    };

    // Create document...
    documentService.create(doc)
    .then(function(result) {
      return decorator.decorate(
          result,
          decorator.document.privacy()
          );
    })
    .then(function(result) {
      const resource = new hal.Resource(result, req.url + '/' + result.id);
      res.status(201).json(resource);
    }, next);
  },

  /**
   * Update document.
   * Can only update:
   * - title
   * - content (only if text content type)
   * - categories
   */
  update: function(req, res, next) {
    req.sanitizeBody('title').trim();
    req.checkBody('title', 'Invalid title').optional().isLength(2, 128);
    const validationErrors = req.validationErrors(true);
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors));
    }

    const doc = req.requestData.document;

    const update = {
      title: req.body.title,
      labels: req.body.labels,
      content: req.body.content
    };
    documentService.update(doc, update)
    .then(function(result) {
      return decorator.decorate(
          result,
          decorator.document.privacy()
          );
    })
    .then(function(result) {
      const resource = new hal.Resource(result, req.url);
      res.status(200).json(resource);
    }, next);
  },

  /**
   * Delete one or more documents.
   */
  del: function(req, res, next) {
    let ids = null;
    if (req.params.id) {
      ids = [req.params.id];
    } else if (req.body && Array.isArray(req.body)) {
      ids = req.body;
    }

    if (ids) {
      // Delete defined ids
      documentService.remove(req.user.uid, ids)
      .then(function() {
        res.status(204).json();
      }, next);
    } else {
      documentService.emptyTrash(req.user.uid)
      .then(function() {
        res.status(204).json();
      }, next);
    }
  }
};

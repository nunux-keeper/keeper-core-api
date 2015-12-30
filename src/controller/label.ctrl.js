'use strict';

const hal    = require('hal'),
      errors = require('../helper').errors,
      labelService = require('../service').label;

/**
 * Controller to manage labels.
 * @module label.ctrl
 */
module.exports = {
  /**
   * Get all user's labels.
   */
  all: function(req, res, next) {
    labelService.all(req.user.uid)
    .then(function(labels) {
      const resource = new hal.Resource({labels: labels}, req.url);
      res.json(resource);
    }, next);
  },

  /**
   * Create new label.
   */
  create: function(req, res, next) {
    req.sanitizeBody('label').escape();
    req.checkBody('label', 'Invalid label value').notEmpty().isLength(4, 64);
    req.checkBody('color', 'Invalid color value').optional().isHexColor();
    const validationErrors = req.validationErrors(true);
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors));
    }

    const newLabel = {
      owner: req.user.uid,
      label: req.body.label,
      color: req.body.color || '#fff'
    };
    labelService.create(newLabel)
    .then(function(label) {
      const resource = new hal.Resource(label, req.url);
      res.status(201).json(resource);
    }, next);
  },

  /**
   * Put label modification.
   */
  update: function(req, res, next) {
    req.sanitizeBody('label').escape();
    req.checkBody('label', 'Invalid label value').notEmpty().isLength(4, 64);
    req.checkBody('color', 'Invalid color value').optional().isHexColor();
    const validationErrors = req.validationErrors(true);
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors));
    }

    const update = {
      label: req.body.label,
      color: req.body.color
    };
    labelService.update(req.requestData.label, update)
    .then(function(label) {
      const resource = new hal.Resource(label, req.url);
      res.status(200).json(resource);
    }, next);
  },

  /**
   * Delete a label.
   */
  del: function(req, res, next) {
    const label = req.requestData.label;
    labelService.remove(label)
    .then(function() {
      res.status(204).json();
    }, next);
  }
};

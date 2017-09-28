'use strict'

const hal = require('hal')
const errors = require('../helper').errors
const urlConfig = require('../helper').urlConfig
const labelService = require('../service').label
const decorator = require('../decorator')

/**
 * Controller to manage labels.
 * @module label.ctrl
 */
module.exports = {
  /**
   * Get all user's labels.
   */
  all: function (req, res, next) {
    labelService.all(req.user.id)
    .then(function (labels) {
      const resource = new hal.Resource({labels}, urlConfig.resolve('/labels'))
      resource.link('get', {href: urlConfig.resolve('/labels/{id}'), templated: true})
      res.json(resource)
    }, next)
  },

  /**
   * Get label details.
   */
  get: function (req, res, next) {
    decorator.decorate(
      req.requestData.label,
      decorator.label.hal()
    )
    .then(function (resource) {
      res.json(resource)
    }, next)
  },

  /**
   * Create new label.
   */
  create: function (req, res, next) {
    req.sanitizeBody('label').escape()
    req.checkBody('label', 'Invalid label value').notEmpty().isLength(2, 64)
    req.checkBody('color', 'Invalid color value').optional().isHexColor()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const newLabel = {
      owner: req.user.id,
      label: req.body.label,
      color: req.body.color || '#fff'
    }
    labelService.create(newLabel)
    .then(function (label) {
      return decorator.decorate(
        label,
        decorator.label.hal()
      )
    })
    .then(function (resource) {
      res.status(201).json(resource)
    }, next)
  },

  /**
   * Put label modification.
   */
  update: function (req, res, next) {
    req.sanitizeBody('label').escape()
    req.checkBody('label', 'Invalid label value').notEmpty().isLength(2, 64)
    req.checkBody('color', 'Invalid color value').optional().isHexColor()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const update = {
      label: req.body.label,
      color: req.body.color
    }
    labelService.update(req.requestData.label, update)
    .then(function (label) {
      return decorator.decorate(
        label,
        decorator.label.hal()
      )
    })
    .then(function (resource) {
      res.status(200).json(resource)
    }, next)
  },

  /**
   * Delete a label.
   */
  del: function (req, res, next) {
    const label = req.requestData.label
    labelService.remove(label)
    .then(function () {
      res.status(205).json()
    }, next)
  },

  /**
   * Restore deleted label.
   */
  restore: function (req, res, next) {
    labelService.get(req.params.labelId, true)
    .then(function (ghost) {
      if (!ghost) {
        return Promise.reject(new errors.NotFound('Label ghost not found.'))
      }
      // Only allow to see own label.
      if (ghost.owner !== req.user.id) {
        return Promise.reject(new errors.Forbidden())
      }
      return labelService.restore(ghost)
    })
    .then(function (label) {
      return decorator.decorate(
        label,
        decorator.label.hal()
      )
    })
    .then(function (resource) {
      res.status(200).json(resource)
    }, next)
  }
}

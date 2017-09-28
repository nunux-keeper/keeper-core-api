'use strict'

const hal = require('hal')
const querystring = require('querystring')
const errors = require('../helper').errors
const urlConfig = require('../helper').urlConfig
const templateHolder = require('../helper').templateHolder
const sharingService = require('../service').sharing
const documentService = require('../service').document
const decorator = require('../decorator')
const eventHandler = require('../event')

/**
 * Controller to manage sharing.
 * @module sharing.ctrl
 */
module.exports = {
  /**
   * Get all user's sharing.
   */
  all: function (req, res, next) {
    sharingService.all(req.user.id)
    .then(function (sharing) {
      const resource = new hal.Resource({sharing}, urlConfig.resolve('/sharing'))
      // TODO Add items links
      res.json(resource)
    }, next)
  },

  /**
   * Get sharing details.
   */
  get: function (req, res, next) {
    decorator.decorate(
      req.requestData.sharing,
      decorator.sharing.hal()
    )
    .then(function (resource) {
      res.json(resource)
    }, next)
  },

  /**
   * Create new sharing.
   */
  create: function (req, res, next) {
    const label = req.requestData.label
    if (label.sharing) {
      // Maybe we should overid the current share...
      return next(new errors.BadRequest('Label already shared.'))
    }
    req.sanitizeBody('sharing').escape()
    req.checkBody('startDate', 'Invalid starting date').optional({ checkFalsy: true }).isDate()
    req.checkBody('endDate', 'Invalid ending date').optional({ checkFalsy: true }).isDate()
    req.checkBody('pub', 'Invalid public flag').optional().isBoolean()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }
    req.sanitizeBody('startDate').toDate()
    req.sanitizeBody('endDate').toDate()
    req.sanitizeBody('pub').toBoolean()

    const newSharing = {
      owner: req.user.id,
      targetLabel: label.id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      pub: req.body.pub
    }
    sharingService.create(newSharing)
    .then(function (sharing) {
      return decorator.decorate(
        sharing,
        decorator.sharing.hal()
      )
    })
    .then(function (resource) {
      res.status(201).json(resource)
    }, next)
  },

  /**
   * Put sharing modification.
   */
  update: function (req, res, next) {
    req.sanitizeBody('sharing').escape()
    req.checkBody('startDate', 'Invalid starting date').optional({ checkFalsy: true }).isDate()
    req.checkBody('endDate', 'Invalid ending date').optional({ checkFalsy: true }).isDate()
    req.checkBody('pub', 'Invalid public flag').optional().isBoolean()
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }
    req.sanitizeBody('startDate').toDate()
    req.sanitizeBody('endDate').toDate()
    req.sanitizeBody('pub').toBoolean()

    const update = {
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      pub: req.body.pub
    }
    sharingService.update(req.requestData.sharing, update)
    .then(function (sharing) {
      return decorator.decorate(
        sharing,
        decorator.sharing.hal()
      )
    })
    .then(function (resource) {
      res.status(200).json(resource)
    }, next)
  },

  /**
   * Delete a sharing.
   */
  del: function (req, res, next) {
    const sharing = req.requestData.sharing
    sharingService.remove(sharing)
    .then(function () {
      res.status(205).json()
    }, next)
  },

  /**
   * Get document of a sharing.
   */
  getDocument: function (req, res, next) {
    // Enrich status with computed properties...
    req.requestData.document.sharing = req.requestData.sharing.id

    decorator.decorate(
      req.requestData.document,
      decorator.document.privacy()
    )
    .then(function (resource) {
      // Broadcast document reading event.
      eventHandler.document.emit('fetch', {doc: resource, viewer: req.user ? req.user.id : 'anonymous'})
      res.json(resource)
    }, next)
  },

  /**
   * Get documents of the sharing.
   */
  getDocuments: function (req, res, next) {
    req.checkQuery('from', 'Invalid from param').optional().isAlphanumeric()
    req.checkQuery('size', 'Invalid size param').optional().isInt({ min: 1, max: 100 })
    req.checkQuery('order', 'Invalid order param').optional().isIn(['asc', 'desc'])
    req.checkQuery('output', 'Invalid output param').optional().isIn(['json', 'rss'])
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const query = Object.assign({order: 'asc', from: 0, size: 50}, req.query, {labels: req.requestData.sharing.targetLabel})
    documentService.search(req.requestData.sharing.owner, query, [decorator.document.privacy()])
    .then(function (result) {
      result.sharing = req.requestData.sharing.id
      const resource = new hal.Resource(result, urlConfig.resolve(req.url, true))
      query.from = query.form + 1
      if (result.total > query.from * query.size) {
        const qs = querystring.stringify(query)
        resource.link('next', urlConfig.resolve(`${req.path}?${qs}`))
      }
      resource.link('get', {href: urlConfig.resolve(`${req.path}/{id}`), templated: true})
      if (req.query.output === 'rss') {
        res.set('Content-Type', 'application/rss+xml')
        res.send(templateHolder.rss(resource))
      } else {
        res.json(resource)
      }
    }, next)
  }
}

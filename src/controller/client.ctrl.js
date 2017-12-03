'use strict'

const _ = require('lodash')
const hal = require('hal')
const errors = require('../helper').errors
const urlConfig = require('../helper').urlConfig
const clientService = require('../service').client
const decorator = require('../decorator')
const validator = require('validator')

const clientSchema = {
  'name': {
    optional: false
  }
}

/**
 * Controller to manage clients.
 * @module client.ctrl
 */
module.exports = {
  /**
   * Get client details.
   */
  get: function (req, res, next) {
    decorator.decorate(
      req.requestData.client,
      decorator.client.hal(),
      decorator.client.privacy()
    )
    .then(resource => {
      res.json(resource)
    }, next)
  },

  /**
   * Get user's clients.
   */
  all: function (req, res, next) {
    clientService.all(req.user.id, [decorator.client.hal(), decorator.client.privacy()])
    .then(clients => {
      const resource = new hal.Resource({clients}, urlConfig.resolve('/clients'))
      resource.link('get', {href: urlConfig.resolve('/clients/{id}'), templated: true})
      res.json(resource)
    }, next)
  },

  /**
   * Create new client.
   */
  create: function (req, res, next) {
    req.sanitizeBody('name').trim()
    req.checkBody(clientSchema)
    req.checkBody('webOrigins', 'Invalid web origins (should be valid URLs)').optional().isArrayOf(i => validator.isURL(i))
    req.checkBody('redirectUris', 'Invalid redirect URIs (should be valid URLs)').isArrayOf(i => validator.isURL(i))
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const newClient = _.pick(req.body, ['name', 'webOrigins', 'redirectUris'])
    clientService.create(req.user.id, newClient)
    .then(client => {
      return decorator.decorate(
        client,
        decorator.client.hal(),
        decorator.client.privacy()
      )
    })
    .then(resource => {
      res.status(201).json(resource)
    }, next)
  },

  /**
   * Put client modification.
   */
  update: function (req, res, next) {
    req.sanitizeBody('name').trim()
    req.checkBody('webOrigins', 'Invalid web origins (should be valid URLs)').optional().isArrayOf(i => validator.isURL(i))
    req.checkBody('redirectUris', 'Invalid redirect URIs (should be valid URLs)').optional().isArrayOf(i => validator.isURL(i))
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const update = _.pick(req.body, ['name', 'webOrigins', 'redirectUris'])
    clientService.update(req.requestData.client, update)
    .then(client => {
      return decorator.decorate(
        client,
        decorator.client.hal(),
        decorator.client.privacy()
      )
    })
    .then(resource => {
      res.status(200).json(resource)
    }, next)
  },

  /**
   * Delete a client.
   */
  del: function (req, res, next) {
    const client = req.requestData.client
    clientService.remove(client)
    .then(function () {
      res.status(205).json()
    }, next)
  }
}

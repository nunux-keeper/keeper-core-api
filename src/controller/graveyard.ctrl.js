'use strict'

const hal = require('hal')
const querystring = require('querystring')
const errors = require('../helper').errors
const globals = require('../helper').globals
const graveyardService = require('../service').graveyard

module.exports = {
  /**
   * Finf documents from the graveyard.
   */
  find: function (req, res, next) {
    req.checkQuery('from', 'Invalid from param').optional().isAlphanumeric()
    req.checkQuery('size', 'Invalid size param').optional().isInt({ min: 1, max: 100 })
    req.checkQuery('order', 'Invalid order param').optional().isIn(['asc', 'desc'])
    const validationErrors = req.validationErrors(true)
    if (validationErrors) {
      return next(new errors.BadRequest(null, validationErrors))
    }

    const query = Object.assign({order: 'asc', from:0, size: 50}, req.query)
    graveyardService.find(req.user.id, query)
    .then(function (result) {
      const resource = new hal.Resource(result, globals.BASE_URL + req.url)
      query.from = query.form + 1
      if (result.total > query.from * query.size) {
        const qs = querystring.stringify(query)
        resource.link('next', globals.BASE_URL + req.path + '?' + qs)
      }
      res.json(resource)
    }, next)
  },

  /**
   * Delete all documents from the graveyard.
   */
  empty: function (req, res, next) {
    graveyardService.empty(req.user.id)
    .then(function () {
      res.status(204).json()
    }, next)
  }
}

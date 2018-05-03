'use strict'

const errors = require('../helper').errors
const decorator = require('../decorator')
const userService = require('../service').user
const documentService = require('../service').document
const labelService = require('../service').label
const sharingService = require('../service').sharing
const webhookService = require('../service').webhook
const storage = require('../storage')
const metrics = require('../metrics/client')
const JSONStream = require('JSONStream')

module.exports = {
  /**
   * Get server informations and statistics.
   */
  getInfos: function (req, res, next) {
    const infos = {}
    userService.count()
    .then(nb => {
      infos.nbUsers = nb
      metrics.gauge('user_total', nb)
      return documentService.count()
    })
    .then(nb => {
      infos.nbDocuments = nb
      metrics.gauge('document_total', nb)
      return labelService.count()
    })
    .then(nb => {
      infos.nbLabels = nb
      metrics.gauge('label_total', nb)
      return sharingService.count()
    })
    .then(nb => {
      infos.nbSharing = nb
      metrics.gauge('sharing_total', nb)
      return webhookService.count()
    })
    .then(nb => {
      infos.nbWebhooks = nb
      metrics.gauge('webhook_total', nb)
      return storage.usage('')
    })
    .then(usage => {
      infos.storage = usage
      metrics.gauge('storage_total', usage)
      res.json(infos)
    })
  },

  /**
   * Get all users with statistics.
   */
  getUsers: function (req, res, next) {
    const decorators = [
      decorator.user.stats(),
      decorator.user.gravatar(),
      decorator.user.hal()
    ]
    userService.stream(decorators)
    .then(function (s) {
      res.append('Content-Type', 'application/json')
      s.pipe(JSONStream.stringify()).pipe(res)
    }, next)
  },

  /**
   * Get user.
   */
  getUser: function (req, res, next) {
    const decorators = [
      decorator.user.stats(),
      decorator.user.gravatar(),
      decorator.user.hal()
    ]
    userService.get(req.params.uid, decorators)
      .then(function (user) {
        res.json(user)
      }, next)
  },

  /**
   * Create new user.
   */
  createUser: function (req, res, next) {
    userService.create(req.params.id)
    .then(function (user) {
      res.status(201).json(user)
    }, next)
  },

  /**
   * Delete an user.
   */
  deleteUser: function (req, res, next) {
    const uid = req.params.uid
    if (req.user.uid === uid || req.user.id === uid) {
      return next(new errors.BadRequest('Unable to self destroy.'))
    }
    userService.remove(uid)
    .then(function () {
      res.status(205).json()
    }, next)
  }
}

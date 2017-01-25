'use strict'

const errors = require('../helper').errors
const decorator = require('../decorator')
const userService = require('../service').user
const documentService = require('../service').document
const jobService = require('../service').job
const metrics = require('../metrics/client')
const JSONStream = require('JSONStream')

module.exports = {
  /**
   * Get server informations and statistics.
   */
  getInfos: function (req, res, next) {
    const infos = {}
    userService.count()
    .then((nb) => {
      infos.nbUsers = nb
      metrics.gauge('user,type=total', nb)
      return documentService.count()
    })
    .then((nb) => {
      infos.nbDocuments = nb
      metrics.gauge('document,type=total', nb)
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
    userService.getByUid(req.params.uid, decorators)
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
    if (req.user.uid === uid) {
      return next(new errors.BadRequest('Unable to self destroy.'))
    }
    userService.remove(uid)
    .then(function () {
      res.status(205).json()
    }, next)
  },

  /**
   * Trigger a new job.
   */
  triggerJob: function (req, res, next) {
    const params = Object.assign({
      title: `${req.params.name} job started by ${req.user.uid}`
    }, req.query)
    const job = jobService.launch(
      req.params.name,
      params,
      jobService.priority.LOW
    )
    job.on('enqueue', () => {
      res.status(201).json({
        id: job.id
      })
    })
  }
}

'use strict'

const errors = require('../helper').errors
const decorator = require('../decorator')
const userService = require('../service').user

module.exports = {
  /**
   * Get usersstatistics.
   */
  getStatistics: function (req, res, next) {
    userService.getStatistics()
    .then(function (stats) {
      res.json(stats)
    }, next)
  },

  /**
   * Get user.
   */
  getUser: function (req, res, next) {
    userService.get(req.params.id)
    .then(function (user) {
      return decorator.decorate(user, decorator.user.stats())
    })
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
    const uid = req.params.id
    if (req.user.id === uid) {
      return next(new errors.BadRequest('Unable to self destroy.'))
    }
    userService.remove(uid)
    .then(function () {
      res.send(205)
    }, next)
  }

}

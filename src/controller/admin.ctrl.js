'use strict'

const errors = require('../helper').errors
const decorator = require('../decorator')
const userService = require('../service').user
const JSONStream = require('JSONStream')

module.exports = {
  /**
   * Get all users with statistics.
   */
  getUsers: function (req, res, next) {
    const decorators = [
      decorator.user.stats(),
      decorator.user.gravatar(),
      decorator.user.hal(req.path)
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
      decorator.user.hal(req.path)
    ]
    userService.get(req.params.id, decorators)
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

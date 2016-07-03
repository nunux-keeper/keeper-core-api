'use strict'

module.exports = function () {
  this.World = require('../support/world.js').World

  this.Given(/^I am a valid user with the uid "([^"]*)"$/, function (uid, callback) {
    this.uid = uid
    callback()
  })

  this.Given(/^I am an anonymous user$/, function (callback) {
    this.uid = null
    callback()
  })

  this.When(/^I am waiting (\d+) ms$/, function (wait, callback) {
    setTimeout(callback, wait)
  })
}


'use strict'

const app = require('../../src/app')

module.exports = function () {
  this.World = require('../support/world.js').World

  this.Given(/^The system is ready$/, {timeout: 10 * 1000}, function (callback) {
    app.isReady().then(() => callback(), callback)
  })

  this.Given(/^I am a valid user with the uid "([^"]*)"$/, function (uid, callback) {
    this.uid = uid
    this.apiKey = null
    callback()
  })

  this.Given(/^I am using the API key$/, function (callback) {
    this.uid = null
    callback()
  })

  this.Given(/^I am an anonymous user$/, function (callback) {
    this.uid = null
    this.apiKey = null
    callback()
  })

  this.When(/^I am waiting (\d+) ms$/, function (wait, callback) {
    setTimeout(callback, wait)
  })
}


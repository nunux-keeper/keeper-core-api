'use strict'

const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

module.exports = function () {
  this.When(/^I access the API "([^"]*)"$/, function (uri, callback) {
    request(app)
    .get(uri)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid, this.apiKey))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      this.httpBody = res.body
      this.httpStatus = res.status
    }.bind(this))
    .end(callback)
  })

  this.Then(/^I should get the API infos$/, function (callback) {
    expect(this.httpStatus).to.equals(200)
    expect(this.httpBody).to.contain.keys('name', 'description', 'version')
    callback()
  })

  this.Then(/^I should be rewarded by a (\d+) HTTP code$/, function (code, callback) {
    expect(this.httpStatus).to.equals(parseInt(code, 10))
    callback()
  })

  this.Then(/^I should exceed my quota$/, function (callback) {
    expect(this.httpStatus).to.equals(403)
    expect(this.httpBody).to.contain.key('error')
    expect(this.httpBody.error).to.equals('User quota exceeded')
    callback()
  })
}


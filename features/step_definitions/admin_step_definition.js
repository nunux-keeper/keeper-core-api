'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const expectUser = function (user) {
  // console.log('ACTUAL', user)
  expect(user).to.contain.keys(
    'id', 'uid', 'date', 'gravatar', 'documents', 'storage', '_links'
  )
}

module.exports = function () {
  this.When(/^I get all the users$/, function (callback) {
    request(app)
    .get('/v2/admin/user/')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      this.httpStatus = res.status
      if (res.status >= 200 && res.status < 300) {
        this.myUsers = res.body
      } else {
        this.myUsers = undefined
      }
    }.bind(this))
    .end(callback)
  })

  this.When(/^I get data of "([^"]*)" user$/, function (uid, callback) {
    request(app)
    .get('/v2/admin/user/' + uid)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expectUser(res.body)
      this.myUser = res.body
    }.bind(this))
    .expect(200, callback)
  })

  this.Then(/^I should find myself into the result$/, function (callback) {
    const uid = this.uid
    expect(this.myUsers).to.not.be.undefined
    var found = _.find(this.myUsers, function (item) {
      expectUser(item)
      return item.uid === uid
    })
    expect(found).to.not.be.undefined
    callback()
  })

  this.Then(/^I should have "([^"]*)" into the user (uid|name)$/, function (value, attr, callback) {
    expect(this.myUser).to.not.be.undefined
    expect(this.myUser[attr]).to.equals(value)
    callback()
  })
}

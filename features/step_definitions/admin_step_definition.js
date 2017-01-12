'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofAnUserObject = ['id', 'uid', 'date', 'gravatar', 'nbDocuments', 'nbLabels', 'nbSharing', 'storageUsage', '_links']

module.exports = function () {
  this.When(/^I get all the users$/, function (callback) {
    request(app)
    .get('/v2/admin/users/')
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
    .get('/v2/admin/users/' + uid)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.body).to.contain.all.keys(ofAnUserObject)
      this.myUser = res.body
    }.bind(this))
    .expect(200, callback)
  })

  this.When(/^I delete the user "([^"]*)"$/, function (uid, callback) {
    request(app)
    .delete('/v2/admin/users/' + uid)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      this.httpStatus = res.status
    }.bind(this))
    .end(callback)
  })

  this.Then(/^I should (not retrieve|retrieve) "([^"]*)" into the result$/, function (get, uid, callback) {
    expect(this.myUsers).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    var found = _.find(this.myUsers, function (item) {
      expect(item).to.contain.all.keys(ofAnUserObject)
      return item.uid === uid
    })
    if (shoulBeRetrieve) {
      expect(found).to.not.be.undefined
    } else {
      expect(found).to.be.undefined
    }
    callback()
  })

  this.Then(/^I should have "([^"]*)" into the user (uid|name)$/, function (value, attr, callback) {
    expect(this.myUser).to.not.be.undefined
    expect(this.myUser[attr]).to.equals(value)
    callback()
  })
}

'use strict'

const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofAProfileObject = ['id', 'uid', 'date']

module.exports = function () {
  this.When(/^I get my profile/, function (callback) {
    request(app)
    .get('/v2/profiles/current?withStats=true')
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofAProfileObject)
      this.myProfile = res.body
    })
    .end(callback)
  })

  this.When(/^I update my profile with:$/, function (attrs, callback) {
    const update = {}
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      update[prop] = value
    })
    request(app)
    .put('/v2/profiles/current')
    .send(update)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofAProfileObject)
      this.myProfile = res.body
      if (this.myProfile.apiKey) {
        this.apiKey = this.myProfile.apiKey
      }
    })
    .end(callback)
  })

  this.Then(/^I should have "([^"]*)" in my profile (uid|name)$/, function (value, attr, callback) {
    expect(this.myProfile).to.not.be.undefined
    expect(this.myProfile[attr]).to.equals(value)
    callback()
  })

  this.Then(/^I should have an API key in my profile$/, function (callback) {
    expect(this.myProfile).to.not.be.undefined
    expect(this.myProfile.apiKey).to.not.be.undefined
    callback()
  })
}

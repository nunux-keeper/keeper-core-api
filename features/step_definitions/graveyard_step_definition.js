'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

module.exports = function () {
  this.When(/^I empty the graveyard$/, function (callback) {
    request(app)
    .delete('/v2/graveyard/documents')
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect(204, callback)
  })

  this.When(/^I get the graveyard$/, function (callback) {
    request(app)
    .get('/v2/graveyard/documents')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.status).to.equals(200)
      expect(res.body.total).not.to.be.null
      this.myGraveyard = res.body
    }.bind(this))
    .end(callback)
  })

  this.When(/^I delete the document from the graveyard$/, function (callback) {
    expect(this.myDocument).to.not.be.undefined
    request(app)
    .delete('/v2/graveyard/documents/' + this.myDocument.id)
    .use(this.setAuthorizationHeader(this.uid))
    .expect(205, callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the document into the graveyard$/, function (get, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myGraveyard).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    const found = _.find(this.myGraveyard.hits, (doc) => {
      return doc.id === this.myDocument.id
    })
    if (shoulBeRetrieve) {
      expect(found).to.not.be.undefined
    } else {
      expect(found).to.be.undefined
    }
    callback()
  })

  this.Then(/^I should have no document into the graveyard$/, function (callback) {
    expect(this.myGraveyard).to.not.be.undefined
    expect(this.myGraveyard.total).to.equals(0)
    callback()
  })
}

'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

module.exports = function () {
  this.When(/^I search documents with:$/, function (attrs, callback) {
    const query = _.reduce(attrs.raw(), (acc, attr) => {
      const prop = attr[0]
      const value = attr[1]
      acc[prop] = value
      return acc
    }, {})

    request(app)
    .get('/v2/documents')
    .query(query)
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(200)
      const docs = res.body
      expect(docs.total).not.to.be.null
      expect(docs.hits).not.to.be.null
      this.myDocuments = docs.hits
    })
    .end(callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the document into the search result$/, function (get, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myDocuments).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    const found = _.find(this.myDocuments, (doc) => {
      return doc.id === this.myDocument.id
    })
    if (shoulBeRetrieve) {
      expect(found).to.not.be.undefined
    } else {
      expect(found).to.be.undefined
    }
    callback()
  })
}

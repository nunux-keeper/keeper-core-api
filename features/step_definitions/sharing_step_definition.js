'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofASharingObject = ['id', 'owner', 'targetLabel', 'pub', 'date', 'startDate']
const ofADocumentObject = ['id', 'title', 'content', 'contentType', 'date', 'sharing']

module.exports = function () {
  this.When(/^I share the label/, function (callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .post(`/v2/labels/${this.myLabel.id}/sharing`)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(201)
      expect(res.body).to.contain.all.keys(ofASharingObject)
      expect(res.body.date).not.to.be.null
      this.mySharing = res.body
    })
    .end(callback)
  })

  this.When(/^I update the sharing:$/, function (attrs, callback) {
    expect(this.myLabel).to.not.be.undefined
    const sharing = {}
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      sharing[prop] = value
    })
    if (sharing.pub) {
      sharing.pub = sharing.pub === 'true'
    }
    request(app)
    .put(`/v2/labels/${this.myLabel.id}/sharing`)
    .send(sharing)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofASharingObject)
      // console.log('compare:', res.body, sharing)
      expect(res.body).to.satisfy((obj) => _.isMatch(obj, sharing))
      this.mySharing = res.body
    })
    .end(callback)
  })

  this.When(/^I remove the sharing$/, function (callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .delete(`/v2/labels/${this.myLabel.id}/sharing`)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect(205, callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the sharing$/, function (get, callback) {
    expect(this.mySharing).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    request(app)
    .get(`/v2/labels/${this.mySharing.targetLabel}/sharing`)
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      if (shoulBeRetrieve) {
        expect(res.status).to.equals(200)
        // console.log('compare:', res.body, this.mySharing)
        expect(_.omit(res.body, 'endDate')).to.eql(_.omit(this.mySharing, 'endDate'))
      } else {
        expect(res.status).to.be.within(401, 404)
      }
    })
    .end(callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the (shared|public) label$/, function (get, type, callback) {
    expect(this.mySharing).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    if (type === 'shared') {
      type = 'sharing'
    }
    request(app)
    .get(`/v2/${type}/${this.mySharing.id}`)
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      if (shoulBeRetrieve) {
        expect(res.status).to.equals(200)
        expect(res.body).to.contain.all.keys(['total', 'hits'])
        this.myDocuments = res.body.hits
        // console.log(this.myDocuments)
      } else {
        expect(res.status).to.be.within(401, 404)
      }
    })
    .end(callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the (shared|public) document$/, function (get, type, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.mySharing).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    if (type === 'shared') {
      type = 'sharing'
    }
    request(app)
    .get(`/v2/${type}/${this.mySharing.id}/${this.myDocument.id}`)
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      if (shoulBeRetrieve) {
        expect(res.status).to.equals(200)
        expect(res.body).to.contain.all.keys(ofADocumentObject)
        // console.log('compare:', res.body, _.omit(this.myDocument, '_links', 'ghost', 'labels', 'owner'))
        expect(_.omit(res.body, 'sharing')).to.eql(_.omit(this.myDocument, '_links', 'ghost', 'labels', 'owner'))
      } else {
        expect(res.status).to.be.within(401, 404)
      }
    })
    .end(callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the (shared|public) feed/, function (get, type, callback) {
    expect(this.mySharing).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    if (type === 'shared') {
      type = 'sharing'
    }
    request(app)
    .get(`/v2/${type}/${this.mySharing.id}`)
    .query({output: 'rss'})
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /rss\+xml/)
    .expect((res) => {
      if (shoulBeRetrieve) {
        expect(res.status).to.equals(200)
        // console.log(res.text)
        expect(res.text).not.to.be.empty
      } else {
        expect(res.status).to.be.within(401, 404)
      }
    })
    .end(callback)
  })
}

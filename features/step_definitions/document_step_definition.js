'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const chance = require('chance').Chance()
const expect = require('chai').expect
const request = require('supertest')

const ofADocumentObject = ['id', 'title', 'content', 'contentType', 'date', 'labels', '_links']

module.exports = function () {
  this.When(/^I create the following document:$/, {timeout: 10 * 1000}, function (attrs, callback) {
    const doc = {
      title: chance.sentence({words: 3})
    }
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      if (prop === 'files' || prop === 'labels') {
        if (doc[prop]) {
          doc[prop].push(value)
        } else {
          doc[prop] = [value]
        }
      } else {
        doc[prop] = value
      }
    })
    if (this.myLabel) {
      doc.labels = [this.myLabel.id]
    }
    const req = request(app).post('/v2/documents')
    if (doc.files) {
      const files = doc.files
      delete doc.files
      req.field('document', JSON.stringify(doc))
      files.forEach(function (file) {
        req.attach('files', file)
      })
    } else {
      req.send(doc).set('Content-Type', 'application/json')
    }
    req.use(this.setAuthorizationHeader(this.uid, this.apiKey))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.status).to.equals(201)
      expect(res.body).to.contain.all.keys(ofADocumentObject)
      expect(res.body.date).not.to.be.null
      this.myDocument = res.body
    }.bind(this))
    .end(callback)
  })

  this.When(/^I create the following html document$/, function (content, callback) {
    request(app)
    .post('/v2/documents')
    .send({
      title: chance.sentence({words: 3}),
      content: content,
      contentType: 'text/html'
    })
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.status).to.equals(201)
      expect(res.body).to.contain.all.keys(ofADocumentObject)
      // expect(res.body.content).to.equals(content)
      expect(res.body.contentType).to.equals('text/html')
      expect(res.body.date).not.to.be.null
      this.myDocument = res.body
    }.bind(this))
    .end(callback)
  })

  this.When(/^I update the document with:$/, function (attrs, callback) {
    expect(this.myDocument).to.not.be.undefined
    const update = {}
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      update[prop] = value
    })
    request(app)
    .put('/v2/documents/' + this.myDocument.id)
    .send(update)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofADocumentObject)
      expect(res.body.date).not.to.be.null
      this.myDocument = res.body
    }.bind(this))
    .end(callback)
  })

  this.When(/^I delete the document$/, function (callback) {
    expect(this.myDocument).to.not.be.undefined
    request(app)
    .delete('/v2/documents/' + this.myDocument.id)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid, this.apiKey))
    .expect(205, callback)
  })

  this.When(/^I restore the document$/, function (callback) {
    expect(this.myDocument).to.not.be.undefined
    request(app)
    .put('/v2/graveyard/documents/' + this.myDocument.id)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect(function (res) {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofADocumentObject)
      // console.log('COMPARE:\n', res.body, '\n', this.myDocument)
      expect(res.body).to.eql(this.myDocument)
    }.bind(this))
    .end(callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the (raw document|document)$/, function (get, raw, callback) {
    expect(this.myDocument).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    const shoulBeRaw = raw === 'raw document'
    const suffix = shoulBeRaw ? '?raw' : ''
    request(app)
    .get('/v2/documents/' + this.myDocument.id + suffix)
    .use(this.setAuthorizationHeader(this.uid, this.apiKey))
    .expect('Content-Type', shoulBeRaw ? this.myDocument.contentType : /json/)
    .expect(function (res) {
      if (shoulBeRetrieve) {
        expect(res.status).to.equals(200)
        if (shoulBeRaw) {
          expect(res.text).to.equals(this.myDocument.content)
        } else {
          expect(res.body).to.contain.all.keys(ofADocumentObject)
          // console.log('COMPARE:\n', res.body, '\n', this.myDocument)
          expect(_.omit(res.body, 'attachments')).to.eql(_.omit(this.myDocument, 'attachments'))
          this.myDocument = res.body
        }
      } else {
        expect(res.status).to.be.within(401, 404)
      }
    }.bind(this))
    .end(callback)
  })

  this.Then(/^I should get the following document:$/, function (attrs, callback) {
    expect(this.myDocument).to.not.be.undefined
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      expect(this.myDocument[prop]).to.equals(value)
    }.bind(this))
    callback()
  })

  this.Then(/^I should have "([^"]*)" into the document (title|content|contentType|origin)$/, function (value, attr, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myDocument[attr]).to.equals(value)
    callback()
  })

  this.Then(/^I should get the following document content$/, function (content, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myDocument.content).to.equals(content)
    callback()
  })
}

'use strict'

const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

module.exports = function () {
  this.Then(/^I should retrieve the document (\d+)(?:st|nd|rd|th) attachment$/, function (index, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myDocument.attachments).to.not.be.undefined
    expect(this.myDocument.attachments).to.have.length.of.at.least(index)
    const attachment = this.myDocument.attachments[index - 1]

    request(app)
    .head('/v2/documents/' + this.myDocument.id + '/files/' + attachment.key)
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', attachment.contentType)
    .expect(200, callback)
  })

  this.Then(/^I should have (\d+) attachment\(s\) of "([^"]*)" into the document$/, function (nb, type, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myDocument.attachments).to.not.be.undefined
    expect(this.myDocument.attachments).to.have.length(nb)
    this.myDocument.attachments.forEach(function (attachment) {
      expect(attachment.contentType).to.equal(type)
    })
    callback()
  })

  this.When(/^I delete the document (\d+)(?:st|nd|rd|th) attachment$/, function (index, callback) {
    expect(this.myDocument).to.not.be.undefined
    expect(this.myDocument.attachments).to.not.be.undefined
    expect(this.myDocument.attachments).to.have.length.of.at.least(index)
    const attachment = this.myDocument.attachments[index - 1]

    request(app)
    .delete('/v2/documents/' + this.myDocument.id + '/files/' + attachment.key)
    .use(this.setAuthorizationHeader(this.uid))
    .expect(205, callback)
  })

  this.When(/^I add attachment\(s\) to the document:$/, function (attrs, callback) {
    expect(this.myDocument).to.not.be.undefined
    const req = request(app).post('/v2/documents/' + this.myDocument.id + '/files')

    attrs.raw().forEach(function (attr) {
      const file = attr[0]
      req.attach('files', file)
    })

    req.use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(201, callback)
  })
}

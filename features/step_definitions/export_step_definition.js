'use strict'

const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const completeResponse = 'event: complete'

module.exports = function () {
  this.When(/^I shedule an export/, function (callback) {
    request(app)
      .post('/v2/exports')
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.status).to.equals(202)
      })
      .end(callback)
  })

  this.Then(/^I should get export status$/, {timeout: 10 * 1000}, function (callback) {
    request(app)
      .get('/v2/exports/status')
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', 'text/event-stream')
      .expect((res) => {
        expect(res.status).to.equals(200)
        expect(res.text).to.include(completeResponse)
        // console.log('RESPONSE TEXT:', res.text)
      })
      .end(callback)
  })

  this.Then(/^I should download the export file$/, function (callback) {
    request(app)
      .head('/v2/exports')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', 'application/zip')
      .expect(200, callback)
  })
}

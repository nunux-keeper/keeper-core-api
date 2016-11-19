'use strict'

const _ = require('lodash')
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofALabelObject = ['id', 'label', 'color', 'date', '_links']

module.exports = function () {
  this.When(/^I create the label "([^"]*)" with "([^"]*)" as color$/, function (label, color, callback) {
    request(app)
    .post('/v2/label')
    .send({
      label: label,
      color: color
    })
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.status).to.equals(201)
      expect(res.body).to.contain.all.keys(ofALabelObject)
      expect(res.body.label).to.equals(label)
      expect(res.body.color).to.equals(color)
    })
    .end(callback)
  })

  this.When(/^I get my labels$/, function (callback) {
    request(app)
    .get('/v2/label')
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.body).to.contain.keys('labels', '_links')
      const labels = res.body.labels
      if (labels.length) {
        labels.forEach(function (label) {
          expect(label).to.contain.all.keys(
            'id', 'label', 'color', 'date'
          )
        })
      }
      this.myLabels = labels
    }.bind(this))
    .expect(200, callback)
  })

  this.Then(/^I should (not get|get) the label "([^"]*)" with "([^"]*)" as color in my labels$/, function (get, label, color, callback) {
    const shouldBeFound = get === 'get'
    expect(this.myLabels).to.not.be.undefined
    var found = _.find(this.myLabels, function (item) {
      return item.label === label && item.color === color
    })
    if (shouldBeFound) {
      expect(found).to.not.be.undefined
      this.myLabel = found
    } else {
      expect(found).to.be.undefined
    }
    callback()
  })

  this.When(/^I update the previous label with value "([^"]*)" and color "([^"]*)"$/, function (label, color, callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .put('/v2/label/' + this.myLabel.id)
    .send({
      label: label,
      color: color
    })
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect(function (res) {
      expect(res.body).to.contain.all.keys(ofALabelObject)
      expect(res.body.id).to.equals(this.myLabel.id)
      expect(res.body.label).to.equals(label)
      expect(res.body.color).to.equals(color)
      this.myLabel = res.body
    }.bind(this))
    .expect(200, callback)
  })

  this.When(/^I delete the previous label$/, function (callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .delete('/v2/label/' + this.myLabel.id)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect(204, callback)
  })

  this.When(/^I restore the previous label$/, function (callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .post('/v2/label/' + this.myLabel.id + '/restore')
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect(function (res) {
      expect(res.body).to.contain.all.keys(ofALabelObject)
      expect(res.body.id).to.equals(this.myLabel.id)
      expect(res.body.label).to.equals(this.myLabel.label)
      expect(res.body.color).to.equals(this.myLabel.color)
    }.bind(this))
    .expect(200, callback)
  })
}

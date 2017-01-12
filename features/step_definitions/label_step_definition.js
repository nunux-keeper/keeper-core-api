'use strict'

const _ = require('lodash')
const chance = require('chance').Chance()
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofALabelObject = ['id', 'label', 'color', 'date', '_links']

module.exports = function () {
  this.When(/^I create the following label:$/, function (attrs, callback) {
    const label = {
      label: chance.word(),
      color: chance.color()
    }
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      label[prop] = value
    })
    request(app)
    .post('/v2/labels')
    .send(label)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(201)
      expect(res.body).to.contain.all.keys(ofALabelObject)
      expect(res.body.label).to.equals(label.label)
      expect(res.body.color).to.equals(label.color)
      this.myLabel = res.body
    })
    .end(callback)
  })

  this.When(/^I get my labels$/, function (callback) {
    request(app)
    .get('/v2/labels')
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(200)
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
    })
    .end(callback)
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
    .put('/v2/labels/' + this.myLabel.id)
    .send({
      label: label,
      color: color
    })
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect('Content-Type', /json/)
    .expect((res) => {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofALabelObject)
      expect(res.body.id).to.equals(this.myLabel.id)
      expect(res.body.label).to.equals(label)
      expect(res.body.color).to.equals(color)
      this.myLabel = res.body
    })
    .end(callback)
  })

  this.When(/^I delete the previous label$/, function (callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .delete('/v2/labels/' + this.myLabel.id)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect(205, callback)
  })

  this.When(/^I restore the previous label$/, function (callback) {
    expect(this.myLabel).to.not.be.undefined
    request(app)
    .put('/v2/graveyard/labels/' + this.myLabel.id)
    .set('Content-Type', 'application/json')
    .use(this.setAuthorizationHeader(this.uid))
    .expect((res) => {
      expect(res.status).to.equals(200)
      expect(res.body).to.contain.all.keys(ofALabelObject)
      expect(res.body.id).to.equals(this.myLabel.id)
      expect(res.body.label).to.equals(this.myLabel.label)
      expect(res.body.color).to.equals(this.myLabel.color)
    })
    .end(callback)
  })
}

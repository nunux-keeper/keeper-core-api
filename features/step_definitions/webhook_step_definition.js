'use strict'

const _ = require('lodash')
const chance = require('chance').Chance()
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofAWebhookObject = ['id', 'url', 'secret', 'labels', 'events', 'active', 'cdate', 'mdate', '_links']

module.exports = function () {
  this.When(/^I create the following webhook:$/, function (attrs, callback) {
    const webhook = {
      url: chance.url()
    }
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      if (prop === 'events' || prop === 'labels') {
        webhook[prop] = value.split(',')
      } else {
        webhook[prop] = value
      }
    })
    request(app)
      .post('/v2/webhooks')
      .send(webhook)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.status).to.equals(201)
        expect(res.body).to.contain.all.keys(ofAWebhookObject)
        expect(res.body.url).to.equals(webhook.url)
        expect(res.body.cdate).not.to.be.null
        expect(res.body.mdate).not.to.be.null
        this.myWebhook = res.body
      })
      .end(callback)
  })

  this.When(/^I update the webhook with:$/, function (attrs, callback) {
    expect(this.myWebhook).to.not.be.undefined
    const update = {}
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      if (prop === 'events' || prop === 'labels') {
        update[prop] = value.split(',')
      } else {
        update[prop] = value
      }
    })
    request(app)
      .put('/v2/webhooks/' + this.myWebhook.id)
      .send(update)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.status).to.equals(200)
        expect(res.body).to.contain.all.keys(ofAWebhookObject)
        expect(res.body.cdate).to.equals(this.myWebhook.cdate)
        expect(res.body.mdate).not.to.equals(this.myWebhook.mdate)
        this.myWebhook = res.body
      })
      .end(callback)
  })

  this.When(/^I delete the webhook$/, function (callback) {
    expect(this.myWebhook).to.not.be.undefined
    request(app)
      .delete('/v2/webhooks/' + this.myWebhook.id)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect(205, callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the webhook$/, function (get, callback) {
    expect(this.myWebhook).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    request(app)
      .get('/v2/webhooks/' + this.myWebhook.id)
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect(function (res) {
        if (shoulBeRetrieve) {
          expect(res.status).to.equals(200)
          expect(res.body).to.contain.all.keys(ofAWebhookObject)
          expect(_.omit(res.body, '_links')).to.eql(_.omit(this.myWebhook, '_links'))
          this.myWebhook = res.body
        } else {
          expect(res.status).to.be.within(401, 404)
        }
      }.bind(this))
      .end(callback)
  })

  this.Then(/^I should retrieve (\d+) active webhook\(s\) with:$/, function (nb, attrs, callback) {
    nb = parseInt(nb, 10)
    const query = _.reduce(attrs.raw(), (acc, attr) => {
      const prop = attr[0]
      const value = attr[1]
      acc[prop] = value
      return acc
    }, {active: true})

    request(app)
      .get('/v2/webhooks')
      .query(query)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.status).to.equals(200)
        expect(res.body).to.contain.keys('webhooks', '_links')
        const webhooks = res.body.webhooks
        expect(webhooks.length).to.equals(nb)
        this.myWebhooks = webhooks
      })
      .end(callback)
  })

  this.Then(/^I should have "([^"]*)" into the webhook (url|secret)$/, function (value, attr, callback) {
    expect(this.myWebhook).to.not.be.undefined
    expect(this.myWebhook[attr]).to.equals(value)
    callback()
  })
}

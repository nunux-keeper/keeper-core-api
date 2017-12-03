'use strict'

const _ = require('lodash')
const chance = require('chance').Chance()
const app = require('../../src/app')
const expect = require('chai').expect
const request = require('supertest')

const ofAClientObject = ['id', 'name', 'clientId', 'secret', 'redirectUris', 'webOrigins', 'cdate', 'mdate', '_links']

module.exports = function () {
  this.When(/^I create the following client:$/, function (attrs, callback) {
    const client = {
      url: chance.url()
    }
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      if (prop === 'webOrigins' || prop === 'redirectUris') {
        client[prop] = value.split(',')
      } else {
        client[prop] = value
      }
    })
    request(app)
      .post('/v2/clients')
      .send(client)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.status).to.equals(201)
        expect(res.body).to.contain.all.keys(ofAClientObject)
        expect(res.body.name).to.equals(client.name)
        expect(res.body.cdate).not.to.be.null
        expect(res.body.mdate).not.to.be.null
        this.myClient = res.body
      })
      .end(callback)
  })

  this.When(/^I update the client with:$/, function (attrs, callback) {
    expect(this.myClient).to.not.be.undefined
    const update = {}
    attrs.raw().forEach(function (attr) {
      const prop = attr[0]
      const value = attr[1]
      if (prop === 'webOrigins' || prop === 'redirectUris') {
        update[prop] = value.split(',')
      } else {
        update[prop] = value
      }
    })
    request(app)
      .put('/v2/clients/' + this.myClient.id)
      .send(update)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.status).to.equals(200)
        expect(res.body).to.contain.all.keys(ofAClientObject)
        expect(res.body.cdate).to.equals(this.myClient.cdate)
        expect(res.body.mdate).not.to.equals(this.myClient.mdate)
        this.myClient = res.body
      })
      .end(callback)
  })

  this.When(/^I delete the client$/, function (callback) {
    expect(this.myClient).to.not.be.undefined
    request(app)
      .delete('/v2/clients/' + this.myClient.id)
      .set('Content-Type', 'application/json')
      .use(this.setAuthorizationHeader(this.uid))
      .expect(205, callback)
  })

  this.Then(/^I should (not retrieve|retrieve) the client$/, function (get, callback) {
    expect(this.myClient).to.not.be.undefined
    const shoulBeRetrieve = get === 'retrieve'
    request(app)
      .get('/v2/clients/' + this.myClient.id)
      .use(this.setAuthorizationHeader(this.uid))
      .expect('Content-Type', /json/)
      .expect(function (res) {
        if (shoulBeRetrieve) {
          expect(res.status).to.equals(200)
          expect(res.body).to.contain.all.keys(ofAClientObject)
          expect(_.omit(res.body, '_links')).to.eql(_.omit(this.myClient, '_links'))
          this.myClient = res.body
        } else {
          expect(res.status).to.be.within(401, 404)
        }
      }.bind(this))
      .end(callback)
  })

  this.Then(/^I should have "([^"]*)" into the client (name|clientId)$/, function (value, attr, callback) {
    expect(this.myClient).to.not.be.undefined
    expect(this.myClient[attr]).to.equals(value)
    callback()
  })
}

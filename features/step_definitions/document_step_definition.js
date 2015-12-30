'use strict';

/*jshint -W030 */ 

var app = require('../../src/app'),
    chance  = require('chance').Chance(),
    expect  = require('chai').expect,
    request = require('supertest');


const expectDocument = function(doc, expected) {
  expect(doc).to.contain.keys(
      'id', 'title', 'content', 'contentType', 'date', 'origin', '_links'
      );
  console.log('ACTUAL', doc);
  if (expected) {
    const doNotCompare = ['_links', 'date', 'attachments', 'labels'];
    console.log('EXPECTED', expected);
    for (let prop in expected) {
      if (expected.hasOwnProperty(prop)) {
        if (doNotCompare.indexOf(prop) < 0) {
          expect(doc[prop]).to.equals(expected[prop]);
        }
      }
    }
  }
};

module.exports = function() {

  this.When(/^I create a random text document$/, function (callback) {
    const doc = {
      title: chance.sentence({words: 5}),
      content: chance.paragraph(),
      contentType: 'text/plain',
      origin: chance.url()
    };
    request(app)
      .post('/v2/document')
      .send(doc)
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.status).to.equals(201);
        const newDoc = res.body;
        expectDocument(newDoc, doc);
        expect(newDoc.date).not.to.be.null;
        this.myDocument = newDoc;
      }.bind(this))
    .end(callback);
  });

  this.Then(/^I should (not retrieve|retrieve) the document$/, function (get, callback) {
    expect(this.myDocument).to.not.be.undefined;
    const shoulBeRetrieve = get === 'retrieve';
    request(app)
      .get('/v2/document/' + this.myDocument.id)
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        if (shoulBeRetrieve) {
          expect(res.status).to.equals(200);
          const doc = res.body;
          expectDocument(doc, this.myDocument);
        } else {
          expect(res.status).to.be.within(401, 404);
        }
      }.bind(this))
    .end(callback);
  });

  this.When(/^I update the document (title|content) with "([^"]*)"$/, function (attr, value, callback) {
    expect(this.myDocument).to.not.be.undefined;
    const update = {};
    update[attr] = value;
    request(app)
      .put('/v2/document/' + this.myDocument.id)
      .send(update)
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.status).to.equals(200);
        const updatedDoc = res.body;
        expectDocument(updatedDoc, update);
        expect(updatedDoc.date).not.to.be.null;
        this.myDocument = updatedDoc;
      }.bind(this))
    .end(callback);
  });

  this.Then(/^I should have "([^"]*)" into the document (title|content)$/, function (value, attr, callback) {
    expect(this.myDocument).to.not.be.undefined;
    expect(this.myDocument[attr]).to.equals(value);
    callback();
  });

  this.When(/^I delete the document$/, function (callback) {
    expect(this.myDocument).to.not.be.undefined;
    request(app)
      .delete('/v2/document/' + this.myDocument.id)
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect(function(res) {
        expect(res.status).to.equals(204);
      }.bind(this))
    .end(callback);
  });
};

'use strict';

/*jshint -W030 */ 

var app = require('../../src/app'),
    chance  = require('chance').Chance(),
    expect  = require('chai').expect,
    request = require('supertest');


const expectDocument = function(doc, expected) {
  //console.log('ACTUAL', doc);
  expect(doc).to.contain.keys(
      'id', 'title', 'content', 'contentType', 'date', 'labels', '_links'
      );
  if (expected) {
    const doNotCompare = ['_links', 'date', 'attachments', 'labels'];
    //console.log('EXPECTED', expected);
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
  this.When(/^I create the following document:$/, function (attrs, callback) {
    const doc = {
      title: chance.sentence({words: 3})
    };
    attrs.raw().forEach(function(attr) {
      const prop = attr[0], value = attr[1];
      doc[prop] = value;
    });
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

  this.When(/^I update the document with:$/, function (attrs, callback) {
    expect(this.myDocument).to.not.be.undefined;
    const update = {};
    attrs.raw().forEach(function(attr) {
      const prop = attr[0], value = attr[1];
      update[prop] = value;
    });
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

  this.When(/^I delete the document$/, function (callback) {
    expect(this.myDocument).to.not.be.undefined;
    request(app)
      .delete('/v2/document/' + this.myDocument.id)
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect(204, callback);
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

  this.Then(/^I should retrieve the document (\d+)(?:st|nd|rd|th) attachment$/, function (index, callback) {
    expect(this.myDocument).to.not.be.undefined;
    expect(this.myDocument.attachments).to.not.be.undefined;
    expect(this.myDocument.attachments).to.have.length.of.at.least(index);
    const attachment = this.myDocument.attachments[index - 1];
    request(app)
      .head('/v2/document/' + this.myDocument.id + '/files/' + attachment.key)
      .set('X-Api-Token', this.token)
      .expect('Content-Type', attachment.contentType)
      .expect(200, callback);
  });

  this.Then(/^I should have "([^"]*)" into the document (title|content|contentType)$/, function (value, attr, callback) {
    expect(this.myDocument).to.not.be.undefined;
    expect(this.myDocument[attr]).to.equals(value);
    callback();
  });

  this.Then(/^I should have (\d+) attachment\(s\) of "([^"]*)" into the document$/, function (nb, type, callback) {
    expect(this.myDocument).to.not.be.undefined;
    expect(this.myDocument.attachments).to.not.be.undefined;
    expect(this.myDocument.attachments).to.have.length(nb);
    this.myDocument.attachments.forEach(function(attachment) {
      expect(attachment.contentType).to.equal(type);
    });
    callback();
  });

};

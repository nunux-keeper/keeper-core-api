'use strict';

/*jshint -W030 */ 

var app = require('../../src/app'),
    expect  = require('chai').expect,
    request = require('supertest');


module.exports = function() {
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

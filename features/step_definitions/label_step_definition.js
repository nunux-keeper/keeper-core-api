'use strict';

/*jshint -W030 */ 

var app = require('../../src/app'),
    _   = require('lodash'),
    expect  = require('chai').expect,
    request = require('supertest');

module.exports = function() {

  this.When(/^I create the label "([^"]*)" with "([^"]*)" as color$/, function (label, color, callback) {
    request(app)
      .post('/v2/label')
      .send({
        label: label,
        color: color
      })
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.status).to.equals(201);
        const newLabel = res.body;
        expect(newLabel).to.contain.keys(
            'id', 'label', 'color', 'date', '_links'
        );
        expect(newLabel.label).to.equals(label);
        expect(newLabel.color).to.equals(color);
      }.bind(this))
    .end(callback);
  });

  this.When(/^I get my labels$/, function (callback) {
    request(app)
      .get('/v2/label')
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        expect(res.body).to.contain.keys('labels', '_links');
        const labels = res.body.labels;
        if (labels.length) {
          labels.forEach(function(label) {
            expect(label).to.contain.keys(
                'id', 'label', 'color', 'date'
                );
          });
        }
        this.myLabels = labels;
      }.bind(this))
    .expect(200, callback);
  });

  this.Then(/^I should (not get|get) the label "([^"]*)" with "([^"]*)" as color in my labels$/, function (get, label, color, callback) {
    const shouldBeFound = get === 'get';
    expect(this.myLabels).to.not.be.undefined;
    var found = _.find(this.myLabels, function(item) {
      return item.label === label && item.color === color;
    }.bind(this));
    if (shouldBeFound) {
      expect(found).to.not.be.undefined;
      this.myLabel = found;
    } else {
      expect(found).to.be.undefined;
    }
    callback();
  });

  this.When(/^I update the previous label with value "([^"]*)" and color "([^"]*)"$/, function (label, color, callback) {
    expect(this.myLabel).to.not.be.undefined;
    request(app)
      .put('/v2/label/' + this.myLabel.id)
      .send({
        label: label,
        color: color
      })
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        const newLabel = res.body;
        expect(newLabel).to.contain.keys(
            'id', 'label', 'color', 'date', '_links'
        );
        expect(newLabel.id).to.equals(this.myLabel.id);
        expect(newLabel.label).to.equals(label);
        expect(newLabel.color).to.equals(color);
        this.myLabel = newLabel;
      }.bind(this))
    .expect(200, callback);
  });

  this.When(/^I delete the previous label$/, function (callback) {
    expect(this.myLabel).to.not.be.undefined;
    request(app)
      .delete('/v2/label/' + this.myLabel.id)
      .set('Content-Type', 'application/json')
      .set('X-Api-Token', this.token)
      .expect(function(/*res*/) {
        this.myLabel = null;
      }.bind(this))
    .expect(204, callback);
  });
};

'use strict';

const url = require('url');

const textListHolder = require('./text-list-holder');

var ADMINS = new Set(process.env.APP_ADMIN ? process.env.APP_ADMIN.split(/[\s,]+/) : []);

var validators = {};

/**
 * Test if uid is an admin.
 * @param {String} uid
 * @return Boolean the test result
 */
validators.isAdmin = function(uid) {
  return ADMINS.has(uid);
};

/**
 * Test if string is into the blacklist.
 * @param {String} str
 * @return Boolean the test result
 */
validators.isBlacklisted = function(str) {
  const u = url.parse(str);
  return textListHolder.blacklist.has(u.hostname);
};

/**
 * Test if string is a supported content type.
 * @param {String} str
 * @return Boolean the test result
 */
validators.isSupportedContentType = function(str) {
  return /^text\//.test(str);
};

/**
 * Test if string is a valid Document ID.
 * @param {String} str
 */
validators.isDocId = function(str) {
  return /^[0-9a-fA-F]{24}$/.test(str);
};


/**
 * Validators helper.
 * @module validators
 */
module.exports = validators;


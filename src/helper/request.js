'use strict';

const request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const customRequest = request.defaults({
  headers: {
    'User-Agent': process.env.APP_USER_AGENT || 'Mozilla/5.0 (compatible; Keeperbot/1.0)',
    'Accept-Encoding': 'gzip'
  }
});

module.exports = customRequest;


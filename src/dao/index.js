'use strict';

const url = require('url');

const DATABASE_URI = process.env.APP_DATABASE || 'mongodb://mongodb/keeper';
const provider = url.parse(DATABASE_URI).protocol.slice(0, -1);

module.exports = require(`./${provider}`)(DATABASE_URI);


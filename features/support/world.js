'use strict';

const jwt = require('jsonwebtoken');

const SECRET = process.env.APP_TOKEN_SECRET;

function World(/*callback*/) {
  this.getToken = function (uid) {
    return jwt.sign({sub: uid}, SECRET);
  };

  //callback(); // tell Cucumber we're finished and to use 'this' as the world instance
}

module.exports.World = World;

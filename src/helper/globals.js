'use strict';


var STATUS_LIFETIMES = function() {
  var ltConfig = process.env.APP_STATUS_LIFETIMES || '1|7|30';
  return ltConfig.split('|').map(function(val) {
    return parseInt(val);
  });
}();

var getIntValue = function(value, defaultValue) {
  return value ? parseInt(value) : defaultValue;
};

/**
 * Globals variables.
 * @module globals
 */
module.exports = {
  // Status lifetimes (in days)
  STATUS_LIFETIMES: STATUS_LIFETIMES,
  // Status quota (by 24h)
  STATUS_USER_QUOTA: getIntValue(process.env.APP_STATUS_USER_QUOTA, 5),
  // Place quota (by 24h)
  PLACE_USER_QUOTA: getIntValue(process.env.APP_PLACE_USER_QUOTA, 5),
  // Place search radius (in meter)
  PLACE_SEARCH_RADIUS: getIntValue(process.env.APP_PLACE_SEARCH_RADIUS, 500)
};


/* jshint -W059 */
/* jshint strict: false */

var errorBuilder = function(code, defaultMessage) {
  return function(msg, meta) {
    this.status = code;
    this.meta = meta;
    this.message = msg || defaultMessage;
    Error.call(this, this.message);
    Error.captureStackTrace(this, arguments.callee);
  };
};

module.exports = {
  BadRequest:   errorBuilder(400, 'Bad request'),
  Unauthorized: errorBuilder(401, 'Unauthorized'),
  Forbidden:    errorBuilder(403, 'Forbidden'),
  NotFound:     errorBuilder(404, 'Not found')
};

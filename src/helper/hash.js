'use strict'

const crypto = require('crypto')

/**
 * Get a hash of a value.
 * @param {String} value
 * @returns {String} hash
 */
const getHash = function (value) {
  return crypto.createHash('md5').update(value).digest('hex')
}

/**
 * Get a hashed name.
 * The name can be a file name or an url.
 * @param {String} name Name to has
 * @param {String} forcedExt Forced extension to set
 * @returns {String} hash
 */
const getHashName = function (name, forcedExt) {
  // Clean query if URL
  const cleanName = name.replace(/\?.*$/, '')
  let ext = forcedExt
  if (!ext) {
    // Try to extract extension
    ext = cleanName.split('.').pop()
    if (ext) {
      ext = ext.match(/^[a-zA-Z0-9]+/)[0]
    }
  }
  // Return hash
  return getHash(cleanName) + (ext ? '.' + ext : '')
}

/**
 * Hash helper.
 * @module hash
 */
module.exports = {
  hash: getHash,
  hashUrl: getHashName,
  hashFilename: getHashName
}


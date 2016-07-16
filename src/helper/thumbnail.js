'use strict'

const when = require('when')
const gm = require('gm')
const crypto = require('crypto')
const webshot = require('webshot')
const logger = require('./logger')
const files = require('./files')

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif'])
const sizes = new Set(['320x200'])

/**
 * Make thumbnail of a file.
 * @param {File} file
 * @param {String} size
 * @param {String} group sub directory group to put in
 * @return {Promise} promise of the thumbnail
 */
const thumbnailFile = function (file, size, group) {
  let ext = file.split('.').pop()
  if (ext) {
    ext = ext.toLowerCase()
  }
  if (!imageExtensions.has(ext)) {
    return when.reject('Input file is not a supported image format.')
  }
  if (!sizes.has(size)) {
    return when.reject('Resizing size is not available.')
  }

  const filename = file.split('/').pop()
  let thumbfile = null

  return files.chmkdir('tmp', 'thumb', group)
  .then(function (dir) {
    thumbfile = files.chpath(dir, filename)
    return files.chexists(thumbfile)
  })
  .then(function (exists) {
    if (exists) {
      return when.resolve(thumbfile)
    }
    logger.debug('Resizing image %s to %s', file, thumbfile)

    const thumbnailed = when.defer()

    const resize = size.split('x')

    gm(file)
    .options({imageMagick: true})
    .resize(resize[0], resize[1], '^')
    .quality(75)
    .gravity('Center')
    .extent(size)
    .write(thumbfile, function (err) {
      if (err) {
        logger.error('Unable to resize image %s', file, err)
        return thumbnailed.reject(err)
      }
      logger.debug('Image %s resized.', file)
      return thumbnailed.resolve(thumbfile)
    })

    return thumbnailed.promise
  })
}

/**
 * Make thumbnail of a page.
 * @param {String} url
 * @return {Promise} promise of the thumbnail
 */
const thumbnailPage = function (url) {
  const urlHash = crypto.createHash('md5').update(url).digest('hex')
  const filename = urlHash + '.png'
  let thumbfile

  return files.chmkdir('tmp', 'thumbpages')
  .then(function (dir) {
    thumbfile = files.chpath(dir, filename)
    return files.chexists(thumbfile)
  })
  .then(function (exists) {
    if (exists) {
      return when.resolve(thumbfile)
    }
    logger.debug('Making thumbnail of the web page: %s -> %s', url, thumbfile)

    const thumbnailed = when.defer()

    const options = {
      shotSize: {
        width: 'window',
        height: 'all'
      },
      phantomConfig: {
        'ignore-ssl-errors': true
      }
    }

    webshot(url, thumbfile, options, function (err) {
      if (err) {
        logger.error('Unable to thumbnail the web page %s', url, err)
        return thumbnailed.reject(err)
      }
      logger.debug('Web page %s thumnailed.', url)
      return thumbnailed.resolve(thumbfile)
    })

    return thumbnailed.promise
  })
}

/**
 * Thumbnail toolkit.
 * @module thumbnail
 */
module.exports = {
  page: thumbnailPage,
  file: thumbnailFile
}

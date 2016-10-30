'use strict'

const _ = require('lodash')
const when = require('when')
const path = require('path')
const files = require('../helper').files
const logger = require('../helper').logger

/**
 * Get resource stream.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the resource stream
 */
const stream = function (container, entry) {
  const p = files.chpath(container, entry)
  return files.chstream(p)
}

/**
 * Get resource infos.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the resource infos
 */
const info = function (container, entry) {
  const p = files.chpath(container, entry)
  return files.chexists(p)
  .then(function (exists) {
    if (!exists) {
      return Promise.resolve(null)
    }
    return files.chstat(p)
    .then(function (stats) {
      const infos = {
        driver: 'local',
        size: stats.size,
        mtime: stats.mtime,
        path: p,
        container: container,
        key: entry
      }
      return Promise.resolve(infos)
    })
  })
}

/**
 * Get container usage.
 * @param {String} container Container name
 * @return {Promise} Promise of the container usage
 */
const usage = function (container) {
  return files.chdu(container).catch((err) => {
    logger.warn('Unable to get storage usage of the container: ' + container, err)
    return Promise.resolve(-1)
  })
}

/**
 * Store resource into a container.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @param {String} s Resource stream
 * @return {Promise} Promise of the action
 */
const store = function (container, entry, s) {
  return files.chmkdir(container)
  .then(function () {
    const p = files.chpath(container, entry)
    return files.chwrite(s, p)
  })
}

/**
 * Move resource from a container to another.
 * @param {String} containerSource Container source name
 * @param {String} entry Resource name
 * @param {String} containerDest Container dest name
 * @return {Promise} Promise of the action
 */
const move = function (containerSource, entry, containerDest) {
  return files.chmkdir(containerDest)
  .then(function () {
    const src = files.chpath(containerSource, entry)
    return files.chmv(src, containerDest)
  })
}

/**
 * Remove resource.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the action
 */
const remove = function (container, entry) {
  const p = entry ? files.chpath(container, entry) : container
  return files.chrm(p)
}

/**
 * Get container name.
 * @param {String...} arguments name parts
 * @return {String} Container name
 */
const getContainerName = function () {
  return path.normalize(path.join.apply(null, arguments))
}

/**
 * Clean container by removing all entries no present in the resource list.
 * @param {String} container Container name
 * @param {Object[]} resources Resource list
 * @retrun {Promise} Promise of the action
 */
const cleanContainer = function (container, resources) {
  const keys = resources.reduce((acc, res) => {
    acc.push(res.key)
    return acc
  }, [])

  // List directory content...
  return files.chmkdir(container)
  .then(() => files.chls(container))
  .then(function (entries) {
    // Removing unused files...
    // Get delta between directory content and key list
    const delta = _.difference(entries, keys)
    return when.map(delta, function (entry) {
      // Remove files delta.
      logger.debug('Removing unused resource: %s ...', entry)
      return remove(container, entry)
    })
    .then(function () {
      // Removing empty files
      const remaining = _.difference(entries, delta)
      return when.map(remaining, function (entry) {
        return info(container, entry)
        .then(function (infos) {
          if (infos && infos.size === 0) {
            return remove(container, entry)
          }
          return Promise.resolve(null)
        })
      })
    })
  })
}

/**
 * Get a local copy of the file.
 * It's a NOOP for this driver because the file is already local.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the local file path
 */
const localCopy = function (container, entry) {
  return Promise.resolve(files.chpath(container, entry))
}

/**
 * Remove a local copy of the file.
 * It's a NOOP for this driver because the file is already local.
 * @param {String} container Container name
 * @param {String} entry Resource name
 * @return {Promise} Promise of the local file path
 */
const localRemove = function (container, entry) {
  return Promise.resolve(files.chpath(container, entry))
}

/**
 * Local file system storage driver.
 * @module local
 */
module.exports = {
  info: info,
  usage: usage,
  stream: stream,
  store: store,
  move: move,
  remove: remove,
  getContainerName: getContainerName,
  cleanContainer: cleanContainer,
  localCopy: localCopy,
  localRemove: localRemove
}


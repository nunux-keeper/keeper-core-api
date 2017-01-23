#!/usr/bin/env node

'use strict'

const _ = require('lodash')
const fs = require('fs')
const AdmZip = require('adm-zip')
const stream = require('stream')
const ObjectID = require('mongodb').ObjectID
const chance = require('chance').Chance()
const storage = require('../../storage')
const files = require('../../helper/files')
const logger = require('../../helper/logger')
const extractor = require('../../extractor')
const userDao = require('../../dao').user
const documentDao = require('../../dao').document
const searchengine = require('../../dao/searchengine')
const labelService = require('../../service').label

const AbstractTask = require('./abstract-task.js')

function forEach (arr, iteratorFn) {
  return arr.reduce(function (p, item) {
    return p.then(function () {
      return iteratorFn(item)
    })
  }, Promise.resolve())
}

const importFile = function (buffer, container, filename) {
  const bufferStream = new stream.PassThrough()
  bufferStream.end(buffer)
  return storage.store(container, filename, bufferStream)
}

const importDocument = function (doc, options) {
  logger.debug('Importing document: %s', doc.id)
  doc.ghost = false
  return new Promise((resolve, reject) => {
    if (options.skipExtractor) {
      return resolve()
    }
    // Extract/Filter content
    extractor.content.extract(doc)
      .then((_doc) => {
        doc.content = _doc.content
        // Merge attachments of the content with declared attachments
        doc.attachments = _.unionWith(doc.attachments, _doc.attachments, (a, b) => a.key === b.key)
        resolve()
      }, reject)
  })
    .then(() => {
      // Save and index the document
      return documentDao.create(doc)
    })
    .then((_doc) => {
      // logger.debug('Document created:', _doc.id)
      if (!searchengine.disabled) {
        // logger.debug('Indexing document:', _doc.id)
        return searchengine.indexDocument(_doc)
      }
      return Promise.resolve(_doc)
    })
    .then((_doc) => {
      logger.info('Document imported:', _doc.id)
      return Promise.resolve(_doc)
    }, function (err) {
      if (err.code && err.code === 11000) {
        logger.info('Document already imported: %s', doc.id)
      } else {
        logger.error('Unable to import document.', err)
      }
      return Promise.resolve()
    })
}

const processDocumentEntry = function (zipEntry, doc, user, options) {
  // If the document is already init, import this one and prepare a new one...
  let action = Promise.resolve()
  if (doc.id) {
    action = importDocument(Object.assign({}, doc), options)
  }
  doc = {
    id: options.keepOriginalId ? zipEntry.entryName.slice(0, -1) : new ObjectID().toHexString(),
    owner: user.id,
    attachments: [],
    labels: []
  }
  return action.then(function () {
    return Promise.resolve(doc)
  })
}

const processAttachmentEntry = function (zipEntry, doc) {
  doc.attachments.push({
    key: 'attachment',
    contentType: doc.contentType,
    contentLenght: zipEntry.header.size,
    origin: null
  })
  // Save attachment to storage
  const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files')
  return importFile(zipEntry.getData(), container, 'attachment')
    .then(() => Promise.resolve(doc))
}

const processContentEntry = function (zipEntry, doc) {
  doc.content = zipEntry.getData().toString('utf8')
  return Promise.resolve(doc)
}

const processMetaEntry = function (zipEntry, doc, labels) {
  const meta = JSON.parse(zipEntry.getData())
  doc.title = meta.title
  doc.contentType = meta.contentType
  doc.date = meta.date
  // Extract document origin (v1: link; v2: origin)
  doc.origin = meta.link || meta.origin

  // Extract attachments (v1: resources; v2: attachments)
  if (meta.resources || meta.attachments) {
    const list = meta.resources || meta.attachments
    list.reduce((acc, res) => {
      acc.push({
        key: res.key,
        contentType: res.type || res.contentType, // Content-Type (v1: type; v2: contentType)
        contentLenght: res.contentLength,
        origin: res.url || res.origin // Origin (v1: url; v2: origin)
      })
      return acc
    }, doc.attachments)
  }

  // Extract document labels
  return processLabels(doc, meta, labels)
}

const processLabels = function (doc, meta, labels) {
  doc.labels = []
  const tasks = []

  const _resolveLabel = (label) => {
    const l = label.toUpperCase()
    return labels.hasOwnProperty(l) ? labels[l] : null
  }

  const _createAndSetLabel = (label) => {
    return labelService.create({
      label: label.label,
      color: label.color || chance.color(),
      owner: doc.owner
    })
      .then((l) => {
        // Add new label to the cache and the document
        labels[l.label.toUpperCase()] = l
        doc.labels.push(l.id)
        return Promise.resolve()
      })
  }

  // Process labels (v1: categories; v2: labels)
  if (meta.categories) {
    for (let category of meta.categories) {
      // Check if the label already exists.
      const label = _resolveLabel(category)
      if (label) {
        doc.labels.push(label.id)
      } else {
        // Create and add the label to the doc
        tasks.push(_createAndSetLabel({label: category}))
      }
    }
  } else if (meta.labels) {
    for (let l of meta.labels) {
      // Check if the label already exists.
      const label = _resolveLabel(l.label)
      if (label) {
        doc.labels.push(label.id)
      } else {
        // Create and add the label to the doc
        tasks.push(_createAndSetLabel(l))
      }
    }
  }
  return Promise.all(tasks).then(() => {
    return Promise.resolve(doc)
  })
}

const processResourceEntry = function (zipEntry, doc) {
  const name = zipEntry.entryName
  const key = name.substr(name.lastIndexOf('/') + 1)
  const index = doc.attachments.findIndex(function (item) {
    return item.key === key
  })
  if (index >= 0) {
    // Update resource size
    doc.attachments[index].contentLenght = zipEntry.header.size
    // Save resource to storage
    const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files')
    return importFile(zipEntry.getData(), container, key)
      .then(() => {
        return Promise.resolve(doc)
      })
  } else {
    logger.warn('File not referenced by meta data: %s', key)
    return Promise.resolve(doc)
  }
}

/**
 * Import user data task.
 * Import documents from zip archive file to user account.
 */
class ImportUserTask extends AbstractTask {
  /**
   * Export user task processing.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  process (job, done) {
    let user, labels
    let counter = 0

    const uid = job.data.uid
    // TODO use dedicated dir
    const file = files.chpath('exports', `${uid}.zip`)
    if (!fs.existsSync(file)) {
      return done(`File to import not found: ${file}`)
    }

    const zip = new AdmZip(file)
    const keepOriginalId = job.data.keepOriginalId || false
    const skipExtractor = job.data.skipExtractor || false

    let doc = {}
    // Load user data
    userDao.findByUid(uid)
      .then((_user) => {
        if (!_user) {
          return Promise.reject(`User ${uid} not found!`)
        }
        user = _user
        logger.debug('Caching user\'s labels...')
        return labelService.all(user.id)
      })
      .then((_labels) => {
        // Put lables into cache
        labels = _labels.reduce((acc, label) => {
          acc[label.id.toUpperCase()] = label
          return acc
        }, {})
        logger.info('Importing documents from file %s to user %s (#%s) ...', file, user.uid, user.id)
        return forEach(zip.getEntries(), (zipEntry) => {
          const name = zipEntry.entryName
          let action = Promise.resolve(doc)
          switch (true) {
            case /^[a-f0-9]+\/$/.test(name):
              // Save previous document and create new one
              counter++
              action = processDocumentEntry(zipEntry, doc, user, {keepOriginalId, skipExtractor})
              break
            case /attachment$/.test(name):
              // Extract document attachment (from v1 archives)
              action = processAttachmentEntry(zipEntry, doc)
              break
            case /content$/.test(name):
              // Extract document content
              action = processContentEntry(zipEntry, doc)
              break
            case /meta.json$/.test(name):
              // Extract document meta data
              action = processMetaEntry(zipEntry, doc, labels)
              break
            case /^[a-f0-9]+\/resources\/[a-f0-9]+/.test(name):
            case /^[a-f0-9]+\/files\/[a-f0-9]+/.test(name):
              // Extract resources
              action = processResourceEntry(zipEntry, doc)
              break
            default:
              logger.debug('Ignoring entry: %s', name)
              break
          }
          return action.then(function (d) {
            doc = d
            return Promise.resolve()
          })
        })
      })
      .then(() => {
        if (doc.id) {
          // Create last document...
          return importDocument(Object.assign({}, doc), {keepOriginalId, skipExtractor})
        } else {
          return Promise.resolve()
        }
      })
      .then(() => {
        job.log(`Imported ${counter} documents from file ${file} to user ${user.uid} (#${user.id})`)
        done(null, {counter, file})
      }, done)
  }
}

module.exports = ImportUserTask

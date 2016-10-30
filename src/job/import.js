#!/usr/bin/env node

'use strict'

const appInfo = require('../../package.json')
const _ = require('lodash')
const program = require('commander')
const AdmZip = require('adm-zip')
const logger = require('../helper/logger')
const assert = require('assert')
const stream = require('stream')
const storage = require('../storage')
const userDao = require('../dao').user
const documentDao = require('../dao').document
const extractor = require('../extractor')
const searchengine = require('../dao/searchengine')
const LabelService = require('../service').label
const ObjectID = require('mongodb').ObjectID
const chance = require('chance').Chance()

process.title = 'keeper-import-job'

function forEach (arr, iteratorFn) {
  return arr.reduce(function (p, item) {
    return p.then(function () {
      return iteratorFn(item)
    })
  }, Promise.resolve())
}

/**
 * Import job.
 * Import documents from zip archive file to user account.
 * @module import
 */
class ImportJob {
  constructor (params) {
    this.uid = params.uid
    this.file = params.file
    this.keepOriginalId = params.keepOriginalId
    this.cache = {}
    this.counter = 0
    this.zip = new AdmZip(params.file)
  }

  halt () {
    require('../dao').shutdown().then(() => {
      logger.info('%d document(s) imported: %s', this.counter, this.file)
      process.exit(0)
    }).catch(function (err) {
      logger.error('Error during shutdown.', err)
      process.exit(1)
    })
    setTimeout(function () {
      logger.error('Could not shutdown gracefully, forcefully shutting down!')
      process.exit(1)
    }, 10000)
  }

  stop (err) {
    if (err) {
      logger.error('ERROR: stopping job...', err)
    } else {
      logger.debug('Stopping job...')
    }
    this.halt()
  }

  processDocumentEntry (zipEntry, doc) {
    // If the document is already init, import this one and prepare a new one...
    let action = Promise.resolve()
    if (doc.id) {
      action = this.importDocument(Object.assign({}, doc))
    }
    doc = {
      id: this.keepOriginalId ? zipEntry.entryName.slice(0, -1) : new ObjectID().toHexString(),
      owner: this.user.id,
      attachments: [],
      labels: []
    }
    return action.then(function () {
      return Promise.resolve(doc)
    })
  }

  processAttachmentEntry (zipEntry, doc) {
    doc.attachments.push({
      key: 'attachment',
      contentType: doc.contentType,
      contentLenght: zipEntry.header.size,
      origin: null
    })
    // Save attachment to storage
    const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files')
    return this.importFile(zipEntry.getData(), container, 'attachment')
    .then(function () {
      return Promise.resolve(doc)
    })
  }

  processContentEntry (zipEntry, doc) {
    doc.content = zipEntry.getData().toString('utf8')
    return Promise.resolve(doc)
  }

  processMetaEntry (zipEntry, doc) {
    const meta = JSON.parse(zipEntry.getData())
    doc.title = meta.title
    doc.contentType = meta.contentType
    doc.date = meta.date
    // Extract document origin (v1: link; v2: origin)
    doc.origin = meta.link || meta.origin

    // Extract attachments (v1: resources; v2: attachments)
    if (meta.resources || meta.attachments) {
      const list = meta.resources || meta.attachments
      list.reduce(function (acc, res) {
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
    return this.processLabels(doc, meta)
  }

  processResourceEntry (zipEntry, doc) {
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
      return this.importFile(zipEntry.getData(), container, key)
      .then(() => {
        return Promise.resolve(doc)
      })
    } else {
      logger.warn('File not referenced by meta data: %s', key)
      return Promise.resolve(doc)
    }
  }

  processLabels (doc, meta) {
    doc.labels = []
    const tasks = []

    const createAndSetLabel = (label) => {
      return LabelService.create({
        label: label.label,
        color: label.color || chance.color(),
        owner: this.user.id
      })
      .then((l) => {
        // Add new label to the cache and the document
        this.cache.labels[l.label.toUpperCase()] = l
        doc.labels.push(l.id)
        return Promise.resolve()
      })
    }

    // Process labels (v1: categories; v2: labels)
    if (meta.categories) {
      for (let category of meta.categories) {
        // Check if the label already exists.
        const label = this._resolveLabel(category)
        if (label) {
          doc.labels.push(label.id)
        } else {
          // Create and add the label to the doc
          tasks.push(createAndSetLabel({label: category}))
        }
      }
    } else if (meta.labels) {
      for (let l of meta.labels) {
        // Check if the label already exists.
        const label = this._resolveLabel(l.label)
        if (label) {
          doc.labels.push(label.id)
        } else {
          // Create and add the label to the doc
          tasks.push(createAndSetLabel(l))
        }
      }
    }
    return Promise.all(tasks).then(() => {
      return Promise.resolve(doc)
    })
  }

  _cacheUserLabels () {
    // Load user's labels
    return LabelService.all(this.user.id)
    .then((labels) => {
      this.cache.labels = labels.reduce((acc, label) => {
        acc[label.label.toUpperCase()] = label
        return acc
      }, {})
      return Promise.resolve(this.cache.labels)
    })
  }

  _resolveLabel (label) {
    const l = label.toUpperCase()
    return this.cache.labels.hasOwnProperty(l) ? this.cache.label[l] : null
  }

  start () {
    let doc = {}
    // Load user data
    return userDao.findByUid(this.uid)
    .then((user) => {
      if (!user) {
        return Promise.reject(`User ${this.uid} not found!`)
      }
      this.user = user
      // Cache user's labels
      return this._cacheUserLabels()
    })
    .then(() => {
      logger.info('Importing documents from file %s to user %s (#%s) ...', this.file, this.user.uid, this.user.id)
      return forEach(this.zip.getEntries(), (zipEntry) => {
        const name = zipEntry.entryName
        let action = Promise.resolve(doc)
        switch (true) {
          case /^[a-f0-9]+\/$/.test(name):
            // Save previous document and create new one
            action = this.processDocumentEntry(zipEntry, doc)
            break
          case /attachment$/.test(name):
            // Extract document attachment (from v1 archives)
            action = this.processAttachmentEntry(zipEntry, doc)
            break
          case /content$/.test(name):
            // Extract document content
            action = this.processContentEntry(zipEntry, doc)
            break
          case /meta.json$/.test(name):
            // Extract document meta data
            action = this.processMetaEntry(zipEntry, doc)
            break
          case /^[a-f0-9]+\/resources\/[a-f0-9]+/.test(name):
          case /^[a-f0-9]+\/files\/[a-f0-9]+/.test(name):
            // Extract resources
            action = this.processResourceEntry(zipEntry, doc)
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
        return this.importDocument(Object.assign({}, doc))
      } else {
        return Promise.resolve()
      }
    })
  }

  importFile (buffer, container, filename) {
    const bufferStream = new stream.PassThrough()
    bufferStream.end(buffer)
    return storage.store(container, filename, bufferStream)
  }

  importDocument (doc) {
    logger.debug('Importing document: %s', doc.id)
    doc.ghost = false
    // Extract/Filter content
    return extractor.content.extract(doc)
    .then(function (_doc) {
      doc.content = _doc.content
      // Merge attachments of the content with declared attachments
      doc.attachments = _.unionWith(doc.attachments, _doc.attachments, (a, b) => a.key === b.key)
      // Save and index the document
      return documentDao.create(doc)
    })
    .then(function (_doc) {
      // logger.debug('Document created:', _doc.id)
      if (!searchengine.disabled) {
        // logger.debug('Indexing document:', _doc.id)
        return searchengine.indexDocument(_doc)
      }
      return Promise.resolve(_doc)
    })
    .then((_doc) => {
      this.counter++
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
}

program.version(appInfo.version)
.description('Import documents from a ZIP archive.')
.option('-v, --verbose', 'Verbose flag')
.option('-d, --debug', 'Debug flag')
.option('-f, --file [file]', 'File to import')
.option('-u, --user [user]', 'Target user (UID)')
.option('-k, --keep-id', 'Keep original document ID')
.parse(process.argv)

logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error')

assert(program.file, 'File parameter not defined')
assert(program.user, 'User parameter not defined')

const job = new ImportJob({
  file: program.file,
  uid: program.user,
  keepOriginalId: program['keep-id']
})

job.start().then(() => job.stop()).catch(job.stop.bind(job))

;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => {
    job.stop((signal === 'SIGINT') ? 'Interrupted' : null)
  })
})


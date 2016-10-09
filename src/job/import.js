#!/usr/bin/env node

'use strict'

const appInfo = require('../../package.json')
const program = require('commander')
const AdmZip = require('adm-zip')
const logger = require('../helper/logger')
const assert = require('assert')
const stream = require('stream')
const storage = require('../storage')
const userDao = require('../dao').user
const documentDao = require('../dao').document
const searchengine = require('../dao/searchengine')
const ObjectID = require('mongodb').ObjectID

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
    this.user = params.user
    this.file = params.file
    this.keepOriginalId = params.keepOriginalId
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
      owner: program.user,
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
    // TODO Extract document labels (v1: categories; v2: labels)
    // Extract resources (v1)
    if (meta.resources || meta.attachments) {
      const list = meta.resources || meta.attachments
      list.reduce(function (acc, res) {
        acc.push({
          key: res.key,
          contentType: res.type,
          origin: res.url
        })
        return acc
      }, doc.attachments)
    }
    return Promise.resolve(doc)
  }

  processResourceEntry (zipEntry, doc) {
    const name = zipEntry.entryName
    const key = name.substr(name.lastIndexOf('/') + 1)
    console.log('attachment', key)
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

  start () {
    let doc = {}
    return userDao.get(this.user)
    .then((user) => {
      if (!user) {
        return Promise.reject('User not found!')
      }
      logger.info('Importing documents from file %s to user %s ...', this.file, user.uid)
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
    // Save and index the document
    return documentDao.create(doc)
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
.option('-u, --user [user]', 'Target user')
.option('-k, --keep-id', 'Keep original document ID')
.parse(process.argv)

logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error')

assert(program.file, 'File parameter not defined')
assert(program.user, 'User parameter not defined')

const job = new ImportJob({
  file: program.file,
  user: program.user,
  keepOriginalId: program['keep-id']
})

job.start().then(() => job.stop()).catch(job.stop)

;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => {
    job.stop((signal === 'SIGINT') ? 'Interrupted' : null)
  })
})


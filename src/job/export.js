#!/usr/bin/env node

'use strict'

const appInfo = require('../../package.json')
const fs = require('fs')
const program = require('commander')
const archiver = require('archiver')
const logger = require('../helper/logger')
const assert = require('assert')
const storage = require('../storage')
const documentDao = require('../dao').document

process.title = 'keeper-export-job'

/**
 * Export job.
 * Export user documents into zip archive file.
 * @module export
 */
class ExportJob {
  constructor (file, user) {
    this.file = file
    this.user = user
    this.counter = 0
    this.output = fs.createWriteStream(file)
    this.output.on('close', this.halt.bind(this))
    this.archive = archiver.create('zip', {})
    this.archive.on('error', (err) => {
      throw err
    })
    this.archive.pipe(this.output)
  }

  halt () {
    require('../dao').shutdown().then(() => {
      logger.info('%d document(s) exported: %s', this.counter, this.file)
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
    if (this.stream) {
      this.stream.destroy()
    }
    if (err) {
      logger.error('ERROR: stopping job...', err)
    } else {
      logger.debug('Stopping job...')
    }
    this.archive.finalize()
  }

  start () {
    logger.info('Exporting documents of %s ...', this.user)
    // Process all user documents...
    let stoppable = false
    documentDao.stream({ owner: this.user })
    .then((s) => {
      this.stream = s
      this.stream.on('err', (err) => this.stop(err))
      this.stream.on('end', () => {
        stoppable = true
      })
      this.stream.on('data', (doc) => {
        logger.info('Exporting document #%s ...', doc.id)
        this.stream.pause()
        // Creat meta buffer
        const meta = new Buffer(JSON.stringify({
          title: doc.title,
          contentType: doc.contentType,
          categories: doc.categories,
          attachments: doc.attachments,
          date: doc.date,
          origin: doc.origin
        }))
        // Create content buffer
        const content = new Buffer(doc.content)
        // Store meta and content into the archive
        const folder = `/${doc.id}`
        this.archive.append(null, { name: `${folder}/` })
        this.archive.append(meta, { name: `${folder}/meta.json` })
        this.archive.append(content, { name: `${folder}/content` })
        this.exportAttachments(doc).then(() => {
          logger.info('Document #%s exported.', doc.id)
          this.counter++
          if (stoppable) {
            this.stop()
          } else {
            this.stream.resume()
          }
        })
      })
    })
  }

  exportAttachment (doc, att) {
    const folder = `/${doc.id}`
    const container = storage.getContainerName(doc.owner, 'documents', doc.id, 'files')
    return storage.info(container, att.key)
    .then((infos) => {
      if (!infos) {
        logger.error('Attachment file not found: %j', att.key)
        return Promise.resolve()
      } else {
        logger.debug('Processing document attachment %j ...', att.key)
        return storage.stream(container, att.key)
      }
    })
    .then((s) => {
      if (s) {
        this.archive.append(s, { name: `${folder}/files/${att.key}` })
        logger.info('Attachment file added: %s', att.key)
      }
      return Promise.resolve()
    })
  }

  exportAttachments (doc) {
    if (!doc.attachments || !doc.attachments.length) {
      return Promise.resolve()
    }
    return new Promise((resolve, reject) => {
      logger.debug('Processing document attachments...')
      const tasks = doc.attachments.reduce((acc, att) => {
        acc.push(this.exportAttachment(doc, att))
        return acc
      }, [])
      Promise.all(tasks).then(resolve, reject)
    })
  }
}

program.version(appInfo.version)
.description('Export documents into a ZIP archive.')
.option('-v, --verbose', 'Verbose flag')
.option('-d, --debug', 'Debug flag')
.option('-f, --file [file]', 'File to create')
.option('-u, --user [user]', 'User to export')
.parse(process.argv)

logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error')

assert(program.file, 'File parameter not defined')
assert(program.user, 'User parameter not defined')

const job = new ExportJob(program.file, program.user)
job.start()

;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => {
    logger.debug('Signal received: %j', signal)
    job.stop((signal === 'SIGINT') ? 'Interrupted' : null)
  })
})


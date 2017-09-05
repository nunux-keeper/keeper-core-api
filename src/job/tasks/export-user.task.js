#!/usr/bin/env node

'use strict'

const fs = require('fs')
const archiver = require('archiver')
const logger = require('../../helper/logger')
const files = require('../../helper/files')
const storage = require('../../storage')
const userDao = require('../../dao').user
const documentDao = require('../../dao').document
const labelService = require('../../service').label

const AbstractTask = require('./abstract-task.js')

const resolveLabels = function (labelIds, labels) {
  return labelIds.reduce((acc, id) => {
    id = id.toUpperCase()
    if (labels.hasOwnProperty(id)) {
      acc.push({
        label: labels[id].label,
        color: labels[id].color
      })
    }
    return acc
  }, [])
}

const exportAttachment = function (archive, doc, att) {
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
        archive.append(s, { name: `${folder}/files/${att.key}` })
        logger.info('Attachment file added: %s', att.key)
      }
      return Promise.resolve()
    })
}

const exportAttachments = function (archive, doc) {
  if (!doc.attachments || !doc.attachments.length) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    logger.debug('Processing document attachments...')
    const tasks = doc.attachments.reduce((acc, att) => {
      acc.push(exportAttachment(archive, doc, att))
      return acc
    }, [])
    Promise.all(tasks).then(resolve, reject)
  })
}

/**
 * Export user data task.
 */
class ExportUserTask extends AbstractTask {
  /**
   * Export user task processing.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  process (job, done) {
    let user, labels
    let counter = 0
    let total = 0
    const uid = job.data.uid
    const file = files.chpath('exports', `${uid}.zip`)
    const output = fs.createWriteStream(file)
    output.on('close', () => done(null, {counter, file}))
    const archive = archiver.create('zip', {})
    archive.on('error', (err) => done(err))
    archive.pipe(output)

    // Load user data
    userDao.findByUid(uid)
      .then((_user) => {
        if (!_user) {
          return done(`User ${uid} not found!`)
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
        return documentDao.count({ owner: user.id })
      })
      .then((count) => {
        total = count
        logger.info('Exporting %d documents of %s (#%s) to %s...', total, user.uid, user.id, file)
        // Process all user documents...
        return documentDao.stream({ owner: user.id })
      })
      .then((s) => {
        const stream = s
        let ended = false
        stream.on('err', (err) => this.stop(err))
        stream.on('end', () => {
          ended = true
        })
        stream.on('data', (doc) => {
          logger.info('Exporting document #%s ...', doc.id)
          stream.pause()
          // Creat meta buffer
          const meta = new Buffer(JSON.stringify({
            title: doc.title,
            contentType: doc.contentType,
            labels: resolveLabels(doc.labels, labels),
            attachments: doc.attachments,
            date: doc.date,
            origin: doc.origin
          }))
          // Create content buffer
          const content = new Buffer(doc.content)
          // Store meta and content into the archive
          const folder = `/${doc.id}`
          archive.append(null, { name: `${folder}/` })
          archive.append(meta, { name: `${folder}/meta.json` })
          archive.append(content, { name: `${folder}/content` })
          exportAttachments(archive, doc).then(() => {
            logger.info('Document #%s exported.', doc.id)
            counter++
            job.progress(counter, total, {completed: counter, total})
            if (ended || total === 1) {
              job.log(`Exported ${counter} documents of ${user.uid} (#${user.id}) to ${file}`)
              archive.finalize()
            } else {
              stream.resume()
            }
          })
        })
      })
  }
}

module.exports = ExportUserTask

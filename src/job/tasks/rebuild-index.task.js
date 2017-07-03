const stream = require('stream')
const logger = require('../../helper/logger')
const documentDao = require('../../dao').document
const searchengine = require('../../dao/searchengine')

const AbstractTask = require('./abstract-task.js')

class IndexationStream extends stream.Writable {
  constructor (job, total) {
    super({objectMode: true})
    this.job = job
    this.counter = 0
    this.total = total
  }

  _write (chunk, encoding, next) {
    const { refresh = false, create = true } = this.job.data
    searchengine.reindexDocument(chunk, {refresh, create})
    .then(() => {
      logger.debug('Document %s re-indexed (%d/%d).', chunk.id, this.counter, this.total)
      this.job.progress(this.counter++, this.total)
      next()
    }, next)
  }
}

class RebuildIndexTask extends AbstractTask {
  /**
   * Rebuild the searchengine index.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  process (job, done) {
    let total = 0
    documentDao.count()
    .then((nb) => {
      total = nb
      return documentDao.stream()
    })
    .then((s) => {
      const idxStream = new IndexationStream(job, total)
      return new Promise((resolve, reject) => {
        s.pipe(idxStream)
          .on('error', reject)
          .once('finish', () => resolve(idxStream.counter))
      })
    })
    .then((nb) => {
      job.log(`${nb} documents re-indexed`)
      done(null, {nb})
    }, (err) => {
      job.log('Unable to re-index documents', err)
      done(err)
    })
  }
}

module.exports = RebuildIndexTask

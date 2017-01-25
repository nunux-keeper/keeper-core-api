const storage = require('../../storage')
const documentDao = require('../../dao').document
const searchengine = require('../../dao/searchengine')

const AbstractTask = require('./abstract-task.js')

class GhostbusterTask extends AbstractTask {
  /**
   * Ghostbuster task.
   * Remove ghost documents from the graveyard.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  process (job, done) {
    const limit = job.data.limit || 100
    const hours = job.data.hours || 2
    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() - (hours * 60 * 60 * 1000))

    documentDao.find({ghost: true, date: {$lte: expirationDate}}, {limit: limit})
      .then((ghosts) => {
        if (!ghosts.length) {
          return Promise.resolve([])
        }
        job.log(`Deleting ${ghosts.length} ghost(s)...`)
        if (ghosts.length >= limit) {
          job.log('It remains some ghosts!')
        }
        const tasks = []
        ghosts.forEach((ghost) => {
          const container = storage.getContainerName(ghost.owner, 'documents', ghost.id)
          const deleted = storage.remove(container)
          deleted.then(() => searchengine.unindexDocument(ghost))
            .then(() => documentDao.remove(ghost))
          tasks.push(deleted)
        })
        return Promise.all(tasks)
      })
      .then((t) => {
        job.log(`${t.length} ghosts deleted`)
        done(null, {nb: t.length})
      }, (err) => {
        job.log('Unable to delete ghosts', err)
        done(err)
      })
  }
}

module.exports = GhostbusterTask

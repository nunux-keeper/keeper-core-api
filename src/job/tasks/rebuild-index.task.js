
const AbstractTask = require('./abstract-task.js')

class RebuildIndexTask extends AbstractTask {
  /**
   * Rebuild the searchengine index.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  process (job, done) {
    done('Not yet implemented')
  }
}

module.exports = RebuildIndexTask

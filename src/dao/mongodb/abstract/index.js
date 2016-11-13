'use strict'

const _ = require('lodash')
const ObjectID = require('mongodb').ObjectID

class AbstractMongodbDao {
  constructor (client, collection) {
    this.client = client
    this.collection = collection
  }

  configure () {
    // No default configuration.
    return Promise.resolve()
  }

  getCollection () {
    return this.client.then((db) => {
      return new Promise((resolve, reject) => {
        db.collection(this.collection, (err, collection) => {
          if (err) {
            return reject(err)
          }
          return resolve(collection)
        })
      })
    })
  }

  objectMapper (doc) {
    if (!doc) {
      return null
    }
    const result = _.omit(doc, '_id')
    if (doc._id) {
      result.id = doc._id.toString()
    }
    return result
  }

  /**
   * Get document.
   * @param {String} id ID of the document.
   * @return {Object} the document
   */
  get (id) {
    return this.getCollection().then((collection) => {
      return collection.findOne({_id: new ObjectID(id)}).then((doc) => {
        return Promise.resolve(this.objectMapper(doc))
      })
    })
  }

  /**
   * Find documents.
   * @param {Object} query Find query.
   * @param {Object} params Find parameters.
   * @return {Array} the documents
   */
  find (query, params) {
    const p = Object.assign({
      size: 100
    }, params || {})

    return this.getCollection().then((collection) => {
      return collection.find(query).limit(p.size).toArray()
    })
    .then((docs) => {
      return Promise.resolve(_.map(docs, this.objectMapper))
    })
  }

  /**
   * Count documents.
   * @param {Object} query Count query.
   * @return {Array} the documents
   */
  count (query) {
    return this.getCollection().then((collection) => {
      return collection.count(query)
    })
  }

  /**
   * Stream documents.
   * @param {Object} query Find query.
   * @return {Stream} the documents stream
   */
  stream (query) {
    return this.getCollection().then((collection) => {
      const s = collection.find(query).stream({transform: this.objectMapper})
      return Promise.resolve(s)
    })
  }

  /**
   * Create a document.
   * @param {Object} doc doc to create
   * @return {Object} the created doc
   */
  create (doc) {
    const newDoc = _.omit(doc, 'id')
    if (doc.id) {
      newDoc._id = new ObjectID(doc.id)
    }
    return this.getCollection().then((collection) => {
      return collection.insertOne(newDoc).then((/* r */) => {
        return Promise.resolve(this.objectMapper(newDoc))
      })
    })
  }

  /**
   * Update a document.
   * @param {Object} doc Document to update
   * @param {Object} update Update to apply
   * @return {Object} the updated document
   */
  update (doc, update) {
    return this.getCollection().then((collection) => {
      return collection.findOneAndUpdate(
          {_id: new ObjectID(doc._id || doc.id)},
          {$set: update},
          {returnOriginal: false, upsert: true}
      )
      .then((r) => {
        return Promise.resolve(this.objectMapper(r.value))
      })
    })
  }

  /**
   * Delete a document.
   * @param {Object} doc Document to to delete
   * @return {Object} the deleted document
   */
  remove (doc) {
    return this.getCollection().then((collection) => {
      return collection.findOneAndDelete({
        _id: doc._id ? doc._id : new ObjectID(doc.id)
      })
      .then((/* r */) => {
        return Promise.resolve(this.objectMapper(doc))
      })
    })
  }
}

module.exports = AbstractMongodbDao

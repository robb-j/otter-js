const Adapter = require('../Adapter')
const OtterError = require('../errors/OtterError')
const processors = require('./processors/mongo')

const clone = require('clone')
const MongoClient = require('mongodb').MongoClient
// const ObjectID = require('mongodb').ObjectID
const { promisify } = require('util')
const { mapAndRemove } = require('../utils')

/** An Otter Adapter to connects to & queries a mongo database */
class MongoAdapter extends Adapter {
  
  /** @return {mongo} The mongo db reference */
  get db() { return this._db }
  
  
  constructor(options = {}) {
    super(options)
    
    if (!options.url) {
      throw OtterError.fromCode('mongoAdapter.missingUrl')
    }
    
    this._db = null
  }
  
  
  async setup(Otter) {
    
    let connect = promisify(MongoClient.connect)
    
    // IDEA: Potential configurations:
    // http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/
    
    // Connect to mongo
    this._db = await connect(this.options.url, {
      poolSize: this.options.poolSize || 5
    })
    
    // Add default processors
    for (let procName in processors) {
      if (!this.processors[procName]) {
        this.processors[procName] = processors[procName].bind(this)
      }
    }
  }
  
  
  supportsAttribute(attribute) {
    
    // TODO: Test this
    
    let allowedTypes = [
      'String', 'Number', 'Date', 'Boolean', 'HasOne', 'HasMany', 'ObjectID'
    ]
    return allowedTypes.includes(attribute.constructor.name)
  }
  
  /** The attributes all models installed on this adapter start with */
  baseAttributes() {
    return {
      id: { type: 'ObjectID', default: null },
      createdAt: Date,
      updatedAt: Date
    }
  }
  
  
  
  /**
   * Unpacks a mongo record for ORM use
   * @param  {object} record The record to unpack
   */
  unpackRecord(record) {
    
    mapAndRemove(record, {
      _id: 'id',
      _createdAt: 'createdAt',
      _updatedAt: 'updatedAt'
    })
    
    // TODO: Convert _id / HasOne values from mongodb.ObjectIDs to strings ?
    
    return record
  }
  
  /**
   * Packs a orm record to be send to mongo
   * @param  {object} record The record to pack
   */
  packRecord(record) {
    
    mapAndRemove(record, {
      id: '_id',
      createdAt: '_createdAt',
      updatedAt: '_updatedAt'
    })
    
    // TODO: Convert all HasOne record to mongodb.ObjectIDs
    
    return record
  }
  
  /**
   * Prepares a set of values to be inserted into mongo
   * @param  {object} record The record to prepare
   */
  prepareRecordForCreate(record) {
    record.createdAt = new Date()
    record.updatedAt = new Date()
    
    this.packRecord(record)
  }
  
  /**
  * Prepares a set a record to be updated into mongo
  * @param  {object} record The record to update
   */
  prepareRecordForUpdate(record) {
    
    // Ensure our values weren't changed
    delete record.id
    delete record.createdAt
    delete record.updatedAt
    
    // Set the updated id
    record.updatedAt = new Date()
    
    // Pack the record up
    this.packRecord(record)
  }
  
  /**
   * Common guards before performing a query
   * @param  {string} modelName The model being queried
   */
  guardQuery(modelName) {
    
    // Fail if not connected to a mongo instance
    if (!this.db) {
      throw OtterError.fromCode('mongoAdapter.notStarted')
    }
    
    // Check the type exists
    this.checkModelName(modelName)
  }
  
  
  
  
  
  async create(modelName, allValues, options) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    // Check values are allowed & add timestamps
    let records = allValues.map(value => clone(value))
    records.forEach(record => {
      this.validateModelValues(modelName, record)
      this.prepareRecordForCreate(record)
    })
    
    // Get the db collection for the model
    let collection = this.db.collection(modelName)
    
    // Execute the query
    let result = await collection.insertMany(records)
    
    // Process & return the records
    let newRecords = result.ops
    newRecords.forEach(this.unpackRecord.bind(this))
    return newRecords
  }
  
  async find(modelName, rawQuery, options) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    // Process the query
    let query = this.makeQuery(modelName, rawQuery, options)
    this.validateModelQuery(query)
    let mongoQuery = this.genMongoQuery(query)
    
    // Start building the operation
    let op = this.db.collection(modelName).find(mongoQuery)
    
    // TODO: Sorts
    // TODO: Pluck
    
    // Apply limits
    if (typeof query.limit === 'number') {
      op.limit(query.limit)
    }
    
    // Execute the operation
    let result = await op.toArray()
    
    // Process records
    result.forEach(record => this.unpackRecord(record))
    
    // Return the result
    return result
  }
  
  async update(modelName, rawQuery, values, options) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    // Generate the query
    let query = this.makeQuery(modelName, rawQuery, options)
    this.validateModelQuery(query)
    let filterQuery = this.genMongoQuery(query)
    
    // Validate & prepare the values
    let updates = clone(values)
    this.validateModelValues(modelName, updates)
    this.prepareRecordForUpdate(updates)
    let updateQuery = { $set: updates }
    
    // Fetch the collection to update
    let collection = this.db.collection(modelName)
    
    // Perform the update
    let res = await collection.updateMany(filterQuery, updateQuery)
    
    // Return the number of updated records
    return res.modifiedCount
  }
  
  async destroy(modelName, rawQuery, options) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    // Generate the query
    let query = this.makeQuery(modelName, rawQuery, options)
    this.validateModelQuery(query)
    let mongoQuery = this.genMongoQuery(query)
    
    // Perform the delete
    let r = await this.db.collection(modelName).deleteMany(mongoQuery)
    
    // Return the number of deleted records
    return r.deletedCount
  }
  
  
  
  
  genMongoQuery(query) {
    
    // Start building a query object
    let mq = {}
    
    // Grab the schema of the model being executed against
    let schema = this.models[query.modelName].schema
    
    // Loop through each procesed query expression
    for (let attrName in query.processed) {
      
      // Evaluate the expression with the corresponding attribute
      Object.assign(mq, this.evaluateExpr(schema[attrName], query.processed[attrName]))
    }
    
    // Map our values to their mongo names
    mapAndRemove(mq, {
      id: '_id',
      createdAt: '_createdAt',
      updatedAt: '_updatedAt'
    })
    
    // Return the new query
    return mq
  }
  
  evaluateExpr(attr, fullExpr) {
    
    // Get the processor from the expression
    let exprProc = this.processors[fullExpr.type]
    
    // If it doesn't have one, throw an error
    if (!exprProc) {
      throw OtterError.fromCode('adapter.unsupportedExpr', 'MongoAdapter', fullExpr.type)
    }
    
    // Process the expression
    return exprProc(attr, fullExpr.expr)
  }
  
}


module.exports = MongoAdapter

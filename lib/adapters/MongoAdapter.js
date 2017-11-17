const Adapter = require('../Adapter')
const OtterError = require('../errors/OtterError')
const processors = require('./processors/mongo')

const MongoClient = require('mongodb').MongoClient
// const ObjectID = require('mongodb').ObjectID
const { promisify } = require('util')

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
  
  
  // TODO: This (v)
  supportsAttribute(attribute) { return true }
  
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
    record.id = record._id
    record.createdAt = record._createdAt
    record.updatedAt = record._updatedAt
    
    delete record._id
    delete record._createdAt
    delete record._updatedAt
    
    // TODO: Convert _id / HasOne values from mongodb.ObjectIDs to strings ?
  }
  
  /**
   * Packs a orm record to be send to mongo
   * @param  {object} record The record to pack
   */
  packRecord(record) {
    record._id = record.id
    record._createdAt = record.createdAt
    record._updatedAt = record.updatedAt
    
    delete record.id
    delete record.createdAt
    delete record.updatedAt
  }
  
  /**
   * Prepares a set of values to be inserted into mongo
   * @param  {[type]} values [description]
   * @return {[type]}        [description]
   */
  prepareValuesForCreate(values) {
    
    values._createdAt = new Date()
    values._updatedAt = new Date()
    
    // TODO: Convert all HasOne values to mongodb.ObjectIDs
    
    return values
  }
  
  /**
   *
   */
  prepareValuesForUpdate(values) {
    
    // Ensure our values weren't changed
    delete values._id
    delete values._createdAt
    delete values._updatedAt
    
    // Set the updated id
    values._updatedAt = new Date()
    
    // TODO: Convert all HasOne values to mongodb.ObjectIDs
    
    return values
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
    let preparedValues = allValues.map(values => {
      this.validateModelValues(modelName, values)
      return this.prepareValuesForCreate(values)
    })
    
    // Get the db collection for the model
    let collection = this.db.collection(modelName)
    
    // Execute the query
    let result = await collection.insertMany(preparedValues)
    
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
    result.forEach(this.unpackRecord.bind(this))
    
    // Return the result
    return result
  }
  
  async update(modelName, rawQuery, values, options) {
    
    // Perform Guards
    this.guardQuery(modelName)
    
    // Generate the query
    let query = this.makeQuery(modelName, rawQuery, options)
    this.validateModelQuery(query)
    let mongoQuery = this.genMongoQuery(query)
    
    // Validate & prepare the values
    this.validateModelValues(modelName, values)
    let updates = { $set: this.prepareValuesForUpdate(values) }
    
    // Fetch the collection to update
    let collection = this.db.collection(modelName)
    
    // Perform the update
    let res = await collection.updateMany(mongoQuery, updates)
    
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
    
    let r = await this.db.collection(modelName).deleteMany(mongoQuery)
    
    return r.deletedCount
  }
  
  
  
  
  genMongoQuery(query) {
    
    // Loop through processed
    // - Get expr processor
    // - Use processor to generate query
    
    let mq = {}
    let schema = this.models[query.modelName].schema
    
    for (let attrName in query.processed) {
      Object.assign(mq, this.evaluateExpr(schema[attrName], query.processed[attrName]))
    }
    
    let toMap = { id: '_id', createdAt: '_createdAt', updatedAt: '_updatedAt' }
    
    for (let attr in toMap) {
      if (mq[attr]) {
        mq[toMap[attr]] = mq[attr]
        delete mq[attr]
      }
    }
    
    return mq
  }
  
  evaluateExpr(attr, fullExpr) {
    
    let exprProc = this.processors[fullExpr.type]
    
    if (!exprProc) {
      throw OtterError.fromCode('adapter.unsupportedExpr', 'MongoAdapter', fullExpr.type)
    }
    
    return exprProc(attr, fullExpr.expr)
  }
  
  
  
  
  // validateModelQuery(query) {
  //   console.log(query)
  //
  //   if (query.where.id) {
  //     query.where._id = query.where.id
  //     delete query.where.id
  //   }
  //
  //   super.validateModelQuery(query)
  // }
  
}


module.exports = MongoAdapter
